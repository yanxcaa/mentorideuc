export const formatDate = (dateString: string, includeYear: boolean = false): string => {
    if (!dateString) return "Sin fecha";

    const date = new Date(dateString);

    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    };

    if (includeYear) {
        options.year = 'numeric';
    }

    return date.toLocaleDateString('es-ES', options).split(" ").map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join(" ");
};


// 23:00
export const formatDateTime = (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return "Sin horario";

    const start = new Date(startTime);
    const end = new Date(endTime);

    const timePart = `${start.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })} • ${end.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    })}`;

    return `${timePart}`;
};