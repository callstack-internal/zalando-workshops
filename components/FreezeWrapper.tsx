import {NavigationState, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState, useRef} from 'react';
import {Freeze} from 'react-freeze';

function getIsScreenBlurred(state: NavigationState, currentRouteKey: string) {
    const lastFullScreenRoute = state.routes[state.routes.length - 1];
    return lastFullScreenRoute.key !== currentRouteKey;
}

interface FreezeWrapperProps {
    children: (isTransitioning: boolean) => React.ReactNode;
}

function FreezeWrapper({children}: FreezeWrapperProps) {
    const navigation = useNavigation();
    const currentRoute = useRoute();

    const [isScreenBlurred, setIsScreenBlurred] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const wasBlurredRef = useRef(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('state', (e) => {
            const wasBlurred = wasBlurredRef.current;
            const nowBlurred = getIsScreenBlurred(e.data.state, currentRoute.key);
            
            wasBlurredRef.current = nowBlurred;
            setIsScreenBlurred(nowBlurred);
            
            // If transitioning from frozen to active, set transitioning state
            if (wasBlurred && !nowBlurred) {
                setIsTransitioning(true);
                
                // Clear after 150ms to allow content to render
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(() => {
                    setIsTransitioning(false);
                }, 150);
            }
        });
        
        return () => {
            unsubscribe();
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentRoute.key, navigation]);

    return <Freeze freeze={isScreenBlurred}>{children(isTransitioning)}</Freeze>;
}

FreezeWrapper.displayName = 'FreezeWrapper';

export default FreezeWrapper;
