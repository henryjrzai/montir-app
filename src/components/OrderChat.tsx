/**
 * Chat Component using react-native-gifted-chat
 */

import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GiftedChat, IMessage, User } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/colors";
import { useAuth } from "../contexts/AuthContext";
import { chatService, ChatUser } from "../services/chat.service";

interface OrderChatProps {
  orderId: string;
  orderData: any; // Type this based on your order structure
  visible: boolean;
  onClose: () => void;
}

export default function OrderChat({
  orderId,
  orderData,
  visible,
  onClose,
}: OrderChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert user data to GiftedChat format
  const currentUser: User = {
    _id: user?.id || 0,
    name: user?.nama || "User",
    avatar: undefined,
  };

  // Subscribe to messages when component mounts
  useEffect(() => {
    if (!visible || !orderId) return;

    setLoading(true);

    const unsubscribe = chatService.subscribeToMessages(
      orderId,
      (chatMessages) => {
        // Convert Firebase messages to GiftedChat format
        const giftedChatMessages: IMessage[] = chatMessages.map((msg) => ({
          _id: msg._id,
          text: msg.text,
          createdAt:
            msg.createdAt instanceof Date
              ? msg.createdAt
              : msg.createdAt.toDate(),
          user: {
            _id: msg.user._id,
            name: msg.user.name,
            avatar: undefined,
          },
        }));

        setMessages(giftedChatMessages);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [orderId, visible]);

  // Handle sending new messages
  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!user || !newMessages.length) return;

      const messageToSend = newMessages[0];

      try {
        const chatUser: ChatUser = {
          _id: user.id,
          name: user.nama,
          role: user.role as "pelanggan" | "montir",
        };

        await chatService.sendMessage(orderId, messageToSend.text, chatUser);

        // Messages will be updated automatically through the subscription
      } catch (error) {
        console.error("Error sending message:", error);
        Alert.alert("Error", "Gagal mengirim pesan. Silakan coba lagi.");
      }
    },
    [orderId, user]
  );

  // Get chat partner info
  const getChatPartnerInfo = () => {
    if (!orderData) return null;

    if (user?.role === "pelanggan" && orderData.montir) {
      return {
        name: orderData.montir.user.nama,
        role: "Montir",
      };
    } else if (user?.role === "montir" && orderData.pelanggan) {
      return {
        name: orderData.pelanggan.nama,
        role: "Pelanggan",
      };
    }
    return null;
  };

  const chatPartner = getChatPartnerInfo();

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backButton}>← Kembali</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Chat Order {orderData?.kode_order}
          </Text>
          {chatPartner && (
            <Text style={styles.headerSubtitle}>
              {chatPartner.role}: {chatPartner.name}
            </Text>
          )}
        </View>
      </View>

      {/* Chat Interface */}
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={currentUser}
        initialText="Ketik pesan..."
        colorScheme="light"
        locale="id"
        // showAvatarForEveryMessage={true}
        // showUserAvatar={true}
        renderAvatar={(props) => {
          const userRole = messages.find(
            (msg) => msg.user._id === props.currentMessage?.user._id
          )?.user.name;
          const isCurrentUser =
            props.currentMessage?.user._id === currentUser._id;

          return (
            <View
              style={[
                styles.avatar,
                isCurrentUser
                  ? styles.currentUserAvatar
                  : styles.otherUserAvatar,
              ]}
            >
              <Text style={styles.avatarText}>
                {props.currentMessage?.user.name?.charAt(0).toUpperCase() ||
                  "?"}
              </Text>
            </View>
          );
        }}
        renderBubble={(props) => {
          const isCurrentUser =
            props.currentMessage?.user._id === currentUser._id;

          return (
            <View
              style={[
                styles.bubble,
                isCurrentUser
                  ? styles.currentUserBubble
                  : styles.otherUserBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isCurrentUser ? styles.currentUserText : styles.otherUserText,
                ]}
              >
                {props.currentMessage?.text}
              </Text>
              <Text
                style={[
                  styles.timeText,
                  isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
                ]}
              >
                {props.currentMessage?.createdAt &&
                  new Date(props.currentMessage.createdAt).toLocaleTimeString(
                    "id-ID",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
              </Text>
            </View>
          );
        }}
        messagesContainerStyle={styles.messagesContainer}
        textInputStyle={styles.textInput}
        containerStyle={styles.chatContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    // marginTop: 2,
  },
  chatContainer: {
    backgroundColor: Colors.background,
  },
  messagesContainer: {
    backgroundColor: Colors.background,
  },
  textInput: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 10,
    backgroundColor: Colors.white,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  currentUserAvatar: {
    backgroundColor: Colors.primary,
  },
  otherUserAvatar: {
    backgroundColor: Colors.gray[400],
  },
  avatarText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginVertical: 2,
    maxWidth: "80%",
  },
  currentUserBubble: {
    backgroundColor: Colors.primary,
    alignSelf: "flex-end",
  },
  otherUserBubble: {
    backgroundColor: Colors.white,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: Colors.white,
  },
  otherUserText: {
    color: Colors.text.primary,
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
  },
  currentUserTime: {
    color: Colors.white,
    opacity: 0.8,
  },
  otherUserTime: {
    color: Colors.text.secondary,
  },
});
