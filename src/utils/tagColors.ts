export function getRepositoryColor (status: string) {
    switch (status) {
        case 'submitted': return 'bg-blue-500';
        case 'reviewed': return 'bg-yellow-500';
        case 'approved': return 'bg-green-500';
        case 'rejected': return 'bg-red-600';
        default: return 'bg-gray-500';
    }
}

export function getSessionColor (status: string) {
    switch (status) {
        case 'booked': return 'bg-green-500';
        case 'canceled': return 'bg-red-500';
        case 'available': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
}

export function getUserTagColor (status: string) {
    switch (status) {
        case 'student': return 'bg-blue-100 text-blue-600 border border-blue-300';
        case 'tutor': return 'bg-green-100 text-green-600 border border-green-300';
        case 'admin': return 'bg-purple-100 text-purple-600 border border-purple-300';
        default: return 'bg-gray-500 text-gray-500 border border-gray-500';
    }
}