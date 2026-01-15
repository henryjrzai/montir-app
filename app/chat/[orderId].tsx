/**
 * Chat Screen - Halaman chat terpisah untuk order
 */

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  LogBox,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GiftedChat, IMessage, User } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../src/constants/colors";
import { useAuth } from "../../src/contexts/AuthContext";
import { chatService, ChatUser } from "../../src/services/chat.service";

// Suppress VirtualizedList warning dari GiftedChat
LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const orderId = params.orderId as string;
  const orderCode = params.orderCode as string;
  const partnerName = params.partnerName as string;
  const partnerRole = params.partnerRole as string;

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
    if (!orderId) return;

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
  }, [orderId]);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Order {orderCode}</Text>
          <Text style={styles.headerSubtitle}>
            {partnerRole}: {partnerName}
          </Text>
        </View>
      </View>

      {/* Chat Interface with Keyboard Avoiding */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={currentUser}
          colorScheme="light"
          locale="id"
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
                {/* Tampilkan nama pengirim jika bukan current user */}
                {!isCurrentUser && (
                  <Text style={styles.senderName}>
                    {props.currentMessage?.user.name}
                  </Text>
                )}

                <Text
                  style={[
                    styles.messageText,
                    isCurrentUser
                      ? styles.currentUserText
                      : styles.otherUserText,
                  ]}
                >
                  {props.currentMessage?.text}
                </Text>

                <Text
                  style={[
                    styles.timeText,
                    isCurrentUser
                      ? styles.currentUserTime
                      : styles.otherUserTime,
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
        />
      </KeyboardAvoidingView>
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
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "bold",
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
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesContainer: {
    backgroundColor: Colors.background,
    paddingVertical: 10,
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginVertical: 2,
    marginHorizontal: 10,
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
  senderName: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
    fontWeight: "600",
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
    fontSize: 11,
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
