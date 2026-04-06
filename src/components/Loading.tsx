import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing, ViewStyle } from 'react-native';

interface AnimatedCustomIndicatorProps {
    color?: string;
    size?: number;
    thickness?: number;
    style?: ViewStyle;
    duration?: number;
    loop?: boolean;
    animating?: boolean;
}

const Loading: React.FC<AnimatedCustomIndicatorProps> = ({
                                                                             color = '#007AFF',
                                                                             size = 40,
                                                                             thickness = 3,
                                                                             style,
                                                                             duration = 1000,
                                                                             loop = true,
                                                                             animating = true,
                                                                         }) => {
    const rotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!animating) {
            rotation.stopAnimation();
            return;
        }

        const animationConfig = {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
        };

        if (loop) {
            Animated.loop(Animated.timing(rotation, animationConfig)).start();
        } else {
            Animated.timing(rotation, animationConfig).start();
        }

        return () => {
            rotation.stopAnimation();
        };
    }, [rotation, duration, loop, animating]);

    const spin = rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View className={`flex-1 bg-white justify-center items-center ${style}`}>
            <View className="p-10 bg-white shadow-md shadow-gray-300 rounded-2xl">
                <Animated.View
                    style={[
                        styles.spinner,
                        {
                            width: size,
                            height: size,
                            borderWidth: thickness,
                            borderColor: color,
                            borderTopColor: 'transparent',
                            borderRadius: size / 2,
                            transform: [{ rotate: spin }],
                        },
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    spinner: {
        borderStyle: 'solid',
    },
});

export default Loading;