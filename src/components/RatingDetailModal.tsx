
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/colors";

interface MontirRatingData {
  nama_montir: string;
  rating_rata_rata: number;
}

interface RatingDetailModalProps {
  visible: boolean;
  onClose: () => void;
  data: MontirRatingData | null;
}

const RatingDetailModal: React.FC<RatingDetailModalProps> = ({
  visible,
  onClose,
  data,
}) => {
  if (!data) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Detail Rating Montir</Text>
          <View style={styles.detailContainer}>
            <Text style={styles.detailLabel}>Nama Montir:</Text>
            <Text style={styles.detailValue}>{data.nama_montir}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.detailLabel}>Rata-rata Rating:</Text>
            <Text style={styles.detailValue}>{data.rating_rata_rata.toFixed(1)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={onClose}
          >
            <Text style={styles.textStyle}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  detailContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonClose: {
    backgroundColor: Colors.primary,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default RatingDetailModal;
