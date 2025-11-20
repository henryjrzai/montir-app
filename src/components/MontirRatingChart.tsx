
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Colors } from "../constants/colors";

interface MontirRatingData {
  nama_montir: string;
  rating_rata_rata: number;
}

interface MontirRatingChartProps {
  data: MontirRatingData[];
  onDataPointClick?: (data: { index: number; value: number }) => void;
}

const MontirRatingChart: React.FC<MontirRatingChartProps> = ({
  data,
  onDataPointClick = () => {},
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No rating data available.</Text>
      </View>
    );
  }

  const chartData = {
    labels: data.map((d) => d.nama_montir),
    datasets: [
      {
        data: data.map((d) => d.rating_rata_rata),
      },
    ],
  };

  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rating Montir</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 40} // from react-native
        height={250}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero={true}
        segments={5}
        showBarTops={false}
        chartConfig={{
          backgroundColor: Colors.gray[50],
          backgroundGradientFrom: Colors.gray[50],
          backgroundGradientTo: Colors.gray[50],
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(103, 173, 91, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          barPercentage: 0.7,
        }}
        style={{
          marginVertical: 8,
          borderRadius: 12,
        }}
        onDataPointClick={onDataPointClick}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    alignItems: 'stretch',
    padding: 10,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 15,
    textAlign: "center",
  },
});


export default MontirRatingChart;

