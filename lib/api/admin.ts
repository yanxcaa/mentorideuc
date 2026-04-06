import {supabase} from "@/lib/supabase";
import {Alert} from "react-native";
import {CareerFormData, DashboardStats, UserFormData} from "@/src/types/auth";

// ---------------- Admin calls ------------------------
export async function getUsers() {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", {ascending: false});

    if (error) throw error;
    return data;
}

export async function getUserById(id: string) {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function createUser(user: UserFormData) {
    try {
        const emailRegex = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$');

        if (user.password.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres");
        }

        if (user.name.length < 4) {
            throw new Error("El nombre debe tener al menos 4 caracteres");
        }

        if (!emailRegex.test(user.email)) {
            throw new Error("Por favor ingresa un email válido");
        }

        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', user.email)
            .maybeSingle();

        if (existingUser) {
            throw new Error(`El usuario con email ${user.email} ya existe en el sistema`);
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
                data: {
                    name: user.name,
                    role: user.role,
                }
            }
        });

        if (authError) {
            switch (authError.message) {
                case 'User already registered':
                    throw new Error('Este correo electrónico ya está registrado');
                case 'Email rate limit exceeded':
                    throw new Error('Demasiados intentos. Por favor espera unos minutos');
                case 'Password should be at least 6 characters':
                    throw new Error('La contraseña debe tener al menos 6 caracteres');
                case 'Invalid email':
                    throw new Error('El formato del email no es válido');
                default:
                    console.error('Auth error details:', authError);
                    throw new Error('Error al crear el usuario. Por favor intenta nuevamente');
            }
        }

        if (!authData.user) {
            throw new Error('No se pudo crear el usuario. Por favor intenta nuevamente');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (user.role === 'student' && user.career_id) {
            try {
                await assignStudentToCareer(authData.user.id, user.career_id);
            } catch (careerError: any) {
                console.error('Error assigning student to career:', careerError);
                throw new Error(`Usuario creado pero no se pudo asignar a la carrera: ${careerError.message}`);
            }
        }

        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .maybeSingle();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            throw new Error('Usuario creado pero hay un problema al cargar el perfil');
        }

        if (!profileData) {
            throw new Error('Usuario creado pero no se pudo encontrar el perfil');
        }

        return {
            success: true,
            data: profileData,
        };

    } catch (error: any) {
        console.error('Error in createUser:', error);
        if (error.message && !error.message.includes('AuthApiError')) {
            throw error;
        }
        throw new Error('Error inesperado al crear el usuario. Por favor contacta al administrador');
    }
}

export async function updateUser(id: string, updates: {
    name?: string;
    role?: string;
    avatar_url?: string;
}) {
    if (updates.name && updates.name.length < 3) {
        Alert.alert("El nombre debe tener al menos 3 caracteres");
    }

    const { data, error } = await supabase
        .from("profiles")
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function deleteUser(id: string) {
    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) {
        const { error: profileError } = await supabase
            .from("profiles")
            .delete()
            .eq("id", id);

        if (profileError) throw profileError;
    }

    return true;
}

export async function cleanUserHistory(userId: string) {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const { data: calendarData, error: calendarDataError } = await supabase
        .from("calendar_events")
        .delete()
        .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
        .or(`status.eq.canceled,status.eq.pending,end_time.lt.${cutoffDate}`);

    if (calendarDataError) throw calendarDataError;

    return { success: true };
}


export async function cleanUserCache(userId: string) {
    const { data: userRepositories, error: userRepositoriesError } = await supabase
        .from("repository")
        .select("id")
        .or(`student_id.eq.${userId},tutor_id.eq.${userId}`);

    if (userRepositoriesError) throw userRepositoriesError;

    if (userRepositories && userRepositories.length > 0) {
        for (const repository of userRepositories) {
            const { data: files, error: listError } = await supabase.storage
                .from('repository-files')
                .list(repository.id);

            if (!listError && files && files.length > 0) {
                const filePaths = files.map(file => `${repository.id}/${file.name}`);
                const { error: storageError } = await supabase.storage
                    .from('repository-files')
                    .remove(filePaths);

                if (storageError) {
                    console.error(`Could not delete storage files for repo ${repository.id}:`, storageError);
                }
            }
        }
    }

    const { error: calendarError } = await supabase
        .from("calendar_events")
        .delete()
        .or(`student_id.eq.${userId},tutor_id.eq.${userId}`);

    if (calendarError) throw calendarError;

    const { error: reposDeleteError } = await supabase
        .from("repository")
        .delete()
        .or(`student_id.eq.${userId},tutor_id.eq.${userId}`);

    if (reposDeleteError) throw reposDeleteError;

    return { success: true };
}

export async function getCareers() {
    const { data: careersData, error: careersError } = await supabase
        .from("careers")
        .select("*")
        .order("name", { ascending: true });

    if (careersError) {
        console.error('Supabase error:', careersError);
        throw new Error(careersError.message);
    }

    if (!careersData) {
        throw new Error('No careers data received');
    }

    return careersData;
}

export async function createCareer(careerData: any) {
    const { data, error } = await supabase
        .from('careers')
        .insert([careerData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getFaculties() {
    return [
        'Ingeniería',
        'Ciencias de la Salud',
        'Ciencias Sociales',
        'Negocios',
        'Artes y Humanidades',
        'Ciencias Básicas'
    ];
}

export async function getCareerDetails(careerId: string) {
    const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('id', careerId)
        .single();

    if (error) throw error;
    return data;
}

export async function getCareerStudents(careerId: string) {
    const { data, error } = await supabase
        .from('student_careers')
        .select(`
            *,
            profiles:student_id (
                id,
                name,
                email
            )
        `)
        .eq('career_id', careerId)
        .eq('is_active', true);

    if (error) throw error;

    return data?.map(item => ({
        id: item.profiles.id,
        name: item.profiles.name,
        email: item.profiles.email,
        current_semester: item.current_semester,
        enroll_date: item.enroll_date,
        enroll_number: item.enroll_number
    })) || [];
}

export async function updateCareer(careerId: string, careerData: CareerFormData) {
    const { data, error } = await supabase
        .from('careers')
        .update(careerData)
        .eq('id', careerId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteCareer(careerId: string) {
    const { data: enrolledStudents, error: checkError } = await supabase
        .from('student_careers')
        .select('id')
        .eq('career_id', careerId)
        .eq('is_active', true)
        .limit(1);

    if (checkError) throw checkError;

    if (enrolledStudents && enrolledStudents.length > 0) {
        throw new Error('No se puede eliminar la carrera porque tiene estudiantes inscritos activos');
    }

    const { error } = await supabase
        .from('careers')
        .delete()
        .eq('id', careerId);

    if (error) throw error;
}

export async function softDeleteCareer(careerId: string) {
    const { data, error } = await supabase
        .from('careers')
        .update({ is_active: false })
        .eq('id', careerId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getActiveCareers() {
    const { data, error } = await supabase
        .from('careers')
        .select('*')
        .eq('is_active', true)
        .order('name');

    if (error) throw error;
    return data || [];
}

export async function assignStudentToCareer(studentId: string, careerId: string) {
    const enrollNumber = `ENR${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();

    const { data, error } = await supabase
        .from('student_careers')
        .insert([
            {
                student_id: studentId,
                career_id: careerId,
                enroll_number: enrollNumber,
                enroll_date: new Date().toISOString().split('T')[0],
                current_semester: 1,
                is_active: true
            }
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getDashboardStats(timeRange: 'week' | 'month' | 'all'): Promise<DashboardStats> {
    const now = new Date();
    let startDate = new Date();

    if (timeRange === 'week') {
        startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
    } else {
        startDate = new Date(0); // All time
    }

    // Get user counts
    const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('role');

    if (usersError) throw usersError;

    const userCounts = users?.reduce((acc, user) => {
        acc.total++;
        if (user.role === 'student') acc.students++;
        if (user.role === 'tutor') acc.tutors++;
        if (user.role === 'admin') acc.admins++;
        return acc;
    }, { total: 0, students: 0, tutors: 0, admins: 0 });

    // Get career count
    const { count: careerCount, error: careerError } = await supabase
        .from('careers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

    if (careerError) throw careerError;

    // Get session counts
    const { data: sessions, error: sessionsError } = await supabase
        .from('calendar_events')
        .select('status, start_time')
        .gte('start_time', startDate.toISOString());

    if (sessionsError) throw sessionsError;

    const sessionStats = sessions?.reduce((acc, session) => {
        acc.total++;
        const isUpcoming = new Date(session.start_time) > now;
        if (isUpcoming) acc.upcoming++;
        if (session.status === 'booked') acc.completed++;
        return acc;
    }, { total: 0, upcoming: 0, completed: 0 });

    // Get repository stats
    const { data: repositories, error: repoError } = await supabase
        .from('repository')
        .select('status')
        .gte('created_at', startDate.toISOString());

    if (repoError) throw repoError;

    const repoStats = repositories?.reduce((acc, repo) => {
        acc.total++;
        if (repo.status === 'submitted') acc.pending++;
        return acc;
    }, { total: 0, pending: 0 });

    // Get active enrollments
    const { count: enrollmentCount, error: enrollmentError } = await supabase
        .from('student_careers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

    if (enrollmentError) throw enrollmentError;

    return {
        totalUsers: userCounts?.total || 0,
        totalStudents: userCounts?.students || 0,
        totalTutors: userCounts?.tutors || 0,
        totalAdmins: userCounts?.admins || 0,
        totalCareers: careerCount || 0,
        totalSessions: sessionStats?.total || 0,
        upcomingSessions: sessionStats?.upcoming || 0,
        completedSessions: sessionStats?.completed || 0,
        totalSubmissions: repoStats?.total || 0,
        pendingReviews: repoStats?.pending || 0,
        activeEnrollments: enrollmentCount || 0,
    };
}

// Get top tutors by session count
export async function getTopTutors() {
    // First, get all tutors
    const { data: tutors, error: tutorsError } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'tutor');

    if (tutorsError) throw tutorsError;

    // Then get session counts for each tutor
    const tutorsWithCounts = await Promise.all(
        tutors?.map(async (tutor) => {
            const { count, error } = await supabase
                .from('calendar_events')
                .select('*', { count: 'exact', head: true })
                .eq('tutor_id', tutor.id)
                .eq('status', 'booked');

            return {
                tutor_id: tutor.id,
                name: tutor.name,
                count: count || 0
            };
        }) || []
    );

    // Sort by count and return top 5
    return tutorsWithCounts
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}

// Get popular careers by enrollment count
export async function getPopularCareers() {
    // First, get all active careers
    const { data: careers, error: careersError } = await supabase
        .from('careers')
        .select('id, name')
        .eq('is_active', true);

    if (careersError) throw careersError;

    // Then get enrollment counts for each career
    const careersWithCounts = await Promise.all(
        careers?.map(async (career) => {
            const { count, error } = await supabase
                .from('student_careers')
                .select('*', { count: 'exact', head: true })
                .eq('career_id', career.id)
                .eq('is_active', true);

            return {
                career_id: career.id,
                name: career.name,
                count: count || 0
            };
        }) || []
    );

    // Sort by count and return top 5
    return careersWithCounts
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}

// Get session trends
export async function getSessionTrends(timeRange: 'week' | 'month') {
    const days = timeRange === 'week' ? 7 : 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
        .from('calendar_events')
        .select('created_at, status')
        .gte('created_at', startDate.toISOString());

    if (error) throw error;
    return data;
}

// Get recent activity
export async function getRecentActivity() {
    // Get recent sessions
    const { data: recentSessions, error: sessionsError } = await supabase
        .from('calendar_events')
        .select(`
      *,
      tutor:profiles!calendar_events_tutor_id_fkey(name),
      student:profiles!calendar_events_student_id_fkey(name)
    `)
        .order('created_at', { ascending: false })
        .limit(10);

    if (sessionsError) throw sessionsError;

    // Get recent users
    const { data: recentUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (usersError) throw usersError;

    // Get recent submissions
    const { data: recentSubmissions, error: submissionsError } = await supabase
        .from('repository')
        .select(`
      *,
      student:profiles!repository_student_id_fkey(name),
      tutor:profiles!repository_tutor_id_fkey(name)
    `)
        .order('created_at', { ascending: false })
        .limit(10);

    if (submissionsError) throw submissionsError;

    return {
        recentSessions: recentSessions || [],
        recentUsers: recentUsers || [],
        recentSubmissions: recentSubmissions || []
    };
}
