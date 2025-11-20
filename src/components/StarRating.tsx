import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "../constants/colors";

interface StarRatingProps {
  rating: number;
  onSelectRating: (rating: number) => void;
  starSize?: number;
  containerStyle?: object;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onSelectRating,
  starSize = 30,
  containerStyle,
}) => {
  const renderStar = (index: number) => {
    const starIcon = index <= rating ? "star" : "star-o"; // 'star' for filled, 'star-o' for outline
    const starColor = index <= rating ? Colors.warning : Colors.gray[400];

    return (
      <TouchableOpacity
        key={index}
        onPress={() => onSelectRating(index)}
        activeOpacity={0.7}
      >
        <FontAwesome name={starIcon} size={starSize} color={starColor} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {[1, 2, 3, 4, 5].map((index) => renderStar(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StarRating;
