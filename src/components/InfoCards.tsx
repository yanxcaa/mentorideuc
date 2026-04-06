import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronUp, Calendar, BookOpen, Clock } from 'lucide-react-native';

interface InfoCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: string;
    onPress?: () => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({
                                               title,
                                               value,
                                               subtitle,
                                               icon,
                                               onPress }) => {

    const getIcon = () => {
        switch (icon) {
            case 'progress':
                return <ChevronUp size={24} color="#1F2937" />;
            case 'calendar':
                return <Calendar size={24} color="#1F2937" />;
            case 'book':
                return <BookOpen size={24} color="#1F2937" />;
            case 'clock':
                return <Clock size={24} color="#1F2937" />;
        }
    };

    return (
        <TouchableOpacity
            className="bg-white border border-gray-300 rounded-2xl p-5 mb-4"
            activeOpacity={0.7}
        >
            <View className="flex-row items-start justify-between">
                <View className="flex-1">
                    <Text className="text-base text-gray-900 mb-2">
                        {title}
                    </Text>
                    <Text className="text-2xl font-bold text-gray-900 mb-2">
                        {value}
                    </Text>
                    <Text className="text-sm text-green-600">
                        {subtitle}
                    </Text>
                </View>
                <View className="w-14 h-14 bg-gray-100 rounded-xl items-center justify-center">
                    {getIcon()}
                </View>
            </View>
        </TouchableOpacity>
    );
}