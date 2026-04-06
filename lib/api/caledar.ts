import {supabase} from "@/lib/supabase";
import {EventStatus, RepositoryStatus} from "@/src/types/auth";

// --------- Calls for Bookings ----------------------
export async function getTutorAvailability(tutorId: string) {
    const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("tutor_id", tutorId)
        .eq("status", EventStatus.AVAILABLE)
        .order("start_time", {ascending: true});

    if (error) throw error;
    return data;
}


export async function createEvent(tutorId: string, startTime: string, endTime: string) {
    const { data, error } = await supabase
        .from("calendar_events")
        .insert([{
            tutor_id: tutorId,
            start_time: startTime,
            end_time: endTime
        }])
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function respondToBooking(eventId: string, accept: boolean) {
    try {
        const status = accept ? EventStatus.BOOKED : EventStatus.CANCELED;

        const { data: updatedEvent, error } = await supabase
            .from("calendar_events")
            .update({ status })
            .eq("id", eventId)
            .eq("status", EventStatus.PENDING)
            .select()
            .maybeSingle();

        if (error) throw error;

        if (accept && updatedEvent) {
            const { data, error: repoError } = await supabase
                .from("repository")
                .insert({
                    booking_id: eventId,
                    student_id: updatedEvent.student_id,
                    tutor_id: updatedEvent.tutor_id,
                    title: updatedEvent.title || `Session ${new Date().toLocaleDateString()}`,
                    description: updatedEvent.description || "",
                    file_url: "",
                    status: RepositoryStatus.SUBMITTED,
                })
                .select()
                .maybeSingle();

            if (repoError) throw repoError;
        } else if (!accept) {
            const { data, error: repoError } = await supabase
                .from("calendar_events")
                .update({ status })
                .eq("id", eventId)
                .eq("status", EventStatus.CANCELED)
                .select()
                .maybeSingle();

            if (repoError) throw repoError;
        }

        return updatedEvent;
    } catch (err: any) {
        console.error("Tutor response error:", err);
        throw err;
    }
}



export async function bookEvent(eventId: string, studentId: string, title: string, description: string) {
    try {
        const { data: bookData, error: bookError } = await supabase
            .from("calendar_events")
            .update({
                student_id: studentId,
                status: EventStatus.PENDING,
                title: title,
                description: description,
            })
            .eq("id", eventId)
            .eq("status", EventStatus.AVAILABLE)
            .select()
            .maybeSingle();

        if (bookError) throw bookError;
        return bookData;
    } catch (error: any) {
        console.error('Booking error:', error);
        throw error;
    }
}


export async function cancelEvent(eventId: string, userId: string) {
    const { data, error } = await supabase
        .from("calendar_events")
        .update({
            status: EventStatus.CANCELED
        })
        .eq("id", eventId)
        .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
        .neq("status", EventStatus.CANCELED)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            throw new Error("Event not found or you don't have permission to cancel it");
        }
        throw error;
    }

    return data;
}

// --------- Calls for Repositories ----------------------
export async function uploadRepositoryFile(repositoryId: string, file: any, uploadedBy: string) {
    try {
        // Generate a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${repositoryId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.mimeType || 'application/octet-stream',
            name: file.name,
        } as any);

        const fileContent = {
            uri: file.uri,
            type: file.mimeType || 'application/octet-stream',
            name: file.name,
        };

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('repository-files')
            .upload(fileName, fileContent as any);

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('repository-files')
            .getPublicUrl(fileName);

        const { data, error } = await supabase
            .from('repository_files')
            .insert({
                repository_id: repositoryId,
                file_name: file.name,
                file_url: publicUrl,
                file_size: file.size || 0,
                file_type: file.mimeType || 'application/octet-stream',
                uploaded_by: uploadedBy
            })
            .select()
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (error: any) {
        console.error('File upload error:', error);
        throw error;
    }
}

export async function getRepositoryFiles(repositoryId: string) {
    const { data, error } = await supabase
        .from('repository_files')
        .select(`
              *,
              uploaded_by:profiles(name)
            `)
        .eq('repository_id', repositoryId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function deleteRepositoryFile(fileId: string) {
    const { data: fileData, error: fileError } = await supabase
        .from('repository_files')
        .select('file_url')
        .eq('id', fileId)
        .maybeSingle();

    if (fileError) throw fileError;

    // Extract file path from URL

    // @ts-ignore
    const filePath = fileData.file_url.split('/').pop();
    const fullPath = `repository-files/${filePath}`;

    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from('repository-files')
        .remove([fullPath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
        .from('repository_files')
        .delete()
        .eq('id', fileId);

    if (dbError) throw dbError;

    return true;
}

// --------- Calls for Feedback----------------------

export async function addFeedback(repositoryId: string, message: string, authorId: string, type = 'tutor') {
    const { data, error } = await supabase
        .from('repository_feedback')
        .insert({
            repository_id: repositoryId,
            author_id: authorId,
            message: message.trim(),
            type: type
        })
        .select(`
              *,
              author:profiles(name)
            `)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function getRepositoryFeedback(repositoryId: string) {
    const { data, error } = await supabase
        .from('repository_feedback')
        .select(`
              *,
              author:profiles(name)
            `)
        .eq('repository_id', repositoryId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getTutorStats(tutorId: string) {
    const { count: scheduledSessions, error: sessionsError } = await supabase
        .from('calendar_events')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', tutorId)
        .eq('status', 'booked')

    const { data: activeStudents, error: studentsError } = await supabase
        .from('calendar_events')
        .select('student_id')
        .eq('tutor_id', tutorId)
        .eq('status', 'booked')

    const uniqueStudents = new Set(activeStudents?.map(s => s.student_id)).size;

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: thisWeekSessions, error: hoursError } = await supabase
        .from('calendar_events')
        .select('start_time, end_time')
        .eq('tutor_id', tutorId)
        .eq('status', 'booked')
        .gte('start_time', startOfWeek.toISOString());

    let weeklyHours = 0;
    thisWeekSessions?.forEach(session => {
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        weeklyHours += hours;
    });

    return {
        scheduledSessions: scheduledSessions || 0,
        activeStudents: uniqueStudents || 0,
        weeklyHours: Math.round(weeklyHours * 10) / 10,
    };
}

export async function getStudentStats(studentId: string) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: thisWeekSessions, error: hoursError } = await supabase
        .from('calendar_events')
        .select('start_time, end_time')
        .eq('student_id', studentId)
        .eq('status', 'booked')
        .gte('start_time', startOfWeek.toISOString());

    let weeklyHours = 0;
    thisWeekSessions?.forEach(session => {
        const start = new Date(session.start_time);
        const end = new Date(session.end_time);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        weeklyHours += hours;
    });

    const { count: completedSessions, error: completedError } = await supabase
        .from('calendar_events')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('status', 'booked')
        .lt('start_time', new Date().toISOString());

    const { count: pendingSubmissions, error: submissionsError } = await supabase
        .from('repository')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('status', 'submitted');

    return {
        upcomingSessions: Math.round(weeklyHours * 10) / 10,
        completedSessions: completedSessions || 0,
        pendingSubmissions: pendingSubmissions || 0,
    };
}