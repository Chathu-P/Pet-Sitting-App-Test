import React, { useEffect } from "react";
import { View, StyleSheet, Animated, ViewStyle, StyleProp } from "react-native";
import { COLORS } from "../utils/constants";

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
  animated = true,
}) => {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    );

    animation.start();
    return () => animation.reset();
  }, [shimmerAnim, animated]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity: animated ? opacity : 0.5,
        },
        style,
      ]}
    />
  );
};

// Skeleton for chat item
export const ChatListSkeleton: React.FC = () => {
  return (
    <View style={styles.chatListItem}>
      <SkeletonLoader width="100%" height={16} borderRadius={4} />
      <SkeletonLoader
        width="80%"
        height={12}
        borderRadius={4}
        style={{ marginTop: 8 }}
      />
    </View>
  );
};

// Skeleton for request card
export const RequestCardSkeleton: React.FC = () => {
  return (
    <View style={styles.requestCard}>
      <SkeletonLoader width="60%" height={18} borderRadius={4} />
      <SkeletonLoader
        width="100%"
        height={14}
        borderRadius={4}
        style={{ marginTop: 8 }}
      />
      <SkeletonLoader
        width="70%"
        height={14}
        borderRadius={4}
        style={{ marginTop: 6 }}
      />
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <SkeletonLoader width="30%" height={12} borderRadius={4} />
        <SkeletonLoader
          width="20%"
          height={12}
          borderRadius={4}
          style={{ marginLeft: 10 }}
        />
      </View>
    </View>
  );
};

// Skeleton for diary entry
export const DiaryEntrySkeleton: React.FC = () => {
  return (
    <View style={styles.diaryEntry}>
      <SkeletonLoader width="50%" height={16} borderRadius={4} />
      <SkeletonLoader
        width="100%"
        height={14}
        borderRadius={4}
        style={{ marginTop: 8 }}
      />
      <SkeletonLoader
        width="90%"
        height={14}
        borderRadius={4}
        style={{ marginTop: 6 }}
      />
      <SkeletonLoader
        width="70%"
        height={14}
        borderRadius={4}
        style={{ marginTop: 6 }}
      />
    </View>
  );
};

// Skeleton for user profile
export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.profileSkeleton}>
      <SkeletonLoader
        width={80}
        height={80}
        borderRadius={40}
        style={{ alignSelf: "center", marginBottom: 16 }}
      />
      <SkeletonLoader
        width="60%"
        height={20}
        borderRadius={4}
        style={{ alignSelf: "center", marginBottom: 12 }}
      />
      <SkeletonLoader
        width="80%"
        height={14}
        borderRadius={4}
        style={{ alignSelf: "center", marginBottom: 20 }}
      />
      <SkeletonLoader width="100%" height={14} borderRadius={4} />
      <SkeletonLoader
        width="100%"
        height={14}
        borderRadius={4}
        style={{ marginTop: 8 }}
      />
    </View>
  );
};

// Skeleton list for loading multiple items
export const SkeletonList: React.FC<{
  count?: number;
  type?: "chat" | "request" | "diary" | "user";
}> = ({ count = 5, type = "chat" }) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const renderSkeleton = (index: number) => {
    switch (type) {
      case "chat":
        return <ChatListSkeleton key={index} />;
      case "request":
        return <RequestCardSkeleton key={index} />;
      case "diary":
        return <DiaryEntrySkeleton key={index} />;
      case "user":
        return <SkeletonLoader key={index} width="100%" height={60} />;
      default:
        return <ChatListSkeleton key={index} />;
    }
  };

  return <View>{skeletons.map((i) => renderSkeleton(i))}</View>;
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E6E1DC",
  },
  chatListItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E1DC",
  },
  requestCard: {
    padding: 14,
    backgroundColor: "rgba(207, 199, 193, 0.1)",
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 12,
  },
  diaryEntry: {
    padding: 12,
    backgroundColor: "rgba(207, 199, 193, 0.1)",
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 12,
  },
  profileSkeleton: {
    padding: 16,
    backgroundColor: "rgba(207, 199, 193, 0.1)",
    borderRadius: 12,
  },
});

export default SkeletonLoader;
