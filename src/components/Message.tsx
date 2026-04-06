import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome6, AntDesign } from '@expo/vector-icons';

export interface FeedbackItem {
    id: string;
    type: 'tutor' | 'student' | string;
    message: string;
}

interface MessageSectionProps {
    feedback: FeedbackItem[];
    profile: string;
    emptyMessage?: string;
    emptyIcon?: string;
    emptyIconColor?: string;
    emptyIconSize?: number;
    styles?: {
        container?: string;
        messageContainer?: string;
        tutorMessage?: string;
        studentMessage?: string;
        emptyContainer?: string;
        emptyText?: string;
    };
}

const MessageSection: React.FC<MessageSectionProps> = ({
                                                           feedback, profile,
                                                           emptyMessage = "No hay observaciones",
                                                           emptyIcon = "message",
                                                           emptyIconColor = "#9CA3AF",
                                                           emptyIconSize = 24,
                                                           styles = {}
                                                       }) => {
    const getMessageAlignment = (type: string) => {
        if (profile !== "tutor") {
            switch (type) {
                case 'tutor':
                    return 'rounded-br-none flex-row';
                case 'student':
                    return 'rounded-bl-none flex-row-reverse';
                default:
                    return '';
            }
        } else {
            switch (type) {
                case 'tutor':
                    return 'rounded-br-none flex-row-reverse';
                case 'student':
                    return 'rounded-bl-none flex-row';
                default:
                    return '';
            }
        }
    };

    const getBorder = (type: string) => {
        if (profile !== "tutor") {
            switch (type) {
                case 'tutor':
                    return 'rounded-bl-none';
                case 'student':
                    return 'rounded-br-none';
                default:
                    return '';
            }
        } else {
            switch (type) {
                case 'tutor':
                    return 'rounded-br-none';
                case 'student':
                    return 'rounded-bl-none';
                default:
                    return '';
            }
        }
    }

    if (feedback.length === 0) {
        return (
            <View className={`flex items-center w-full gap-1 flex-col justify-center py-8 ${styles.emptyContainer || ''}`}>
                <AntDesign
                    name={emptyIcon as any}
                    size={emptyIconSize}
                    color={emptyIconColor}
                />
                <Text className={`text-gray-500 text-center mt-2 ${styles.emptyText || ''}`}>
                    {emptyMessage}
                </Text>
            </View>
        );
    }

    return (
        <View className={`flex flex-col w-full ${styles.container || ''}`}>
            {feedback.map((element) => {
                const alignment = getMessageAlignment(element.type);
                const border = getBorder(element.type);

                return (
                    <View
                        key={element.id}
                        className="flex border border-transparent flex-col w-full"
                    >
                        <View className={`flex gap-2 mb-2 items-center ${alignment} ${styles.messageContainer || ''}`}>
                            <Text className={`text-gray-800 w-auto max-w-72 text-base rounded-xl ${border} px-3 py-1 bg-white shadow-sm ${
                                element.type === 'tutor' ? styles.tutorMessage : styles.studentMessage
                            }`}>
                                {element.message || ""}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

export default MessageSection;