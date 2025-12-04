/**
 * Chat Service using Firebase Firestore
 */

import {
  addDoc,
  collection,
  DocumentData,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface ChatMessage {
  _id: string;
  text: string;
  createdAt: Date | Timestamp;
  user: {
    _id: number | string;
    name: string;
    role: "pelanggan" | "montir";
  };
  orderId: string;
}

export interface ChatUser {
  _id: number | string;
  name: string;
  role: "pelanggan" | "montir";
}

class ChatService {
  private messagesCollection = "orderChats";

  /**
   * Send message to Firebase
   */
  async sendMessage(
    orderId: string,
    message: string,
    user: ChatUser
  ): Promise<void> {
    try {
      await addDoc(collection(db, this.messagesCollection), {
        text: message,
        createdAt: serverTimestamp(),
        user: {
          _id: user._id,
          name: user.name,
          role: user.role,
        },
        orderId: orderId,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Subscribe to messages for a specific order
   */
  subscribeToMessages(
    orderId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    try {
      // Simple query tanpa composite index
      const q = query(
        collection(db, this.messagesCollection),
        where("orderId", "==", orderId)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages: ChatMessage[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          messages.push({
            _id: doc.id,
            text: data.text,
            createdAt: data.createdAt?.toDate() || new Date(),
            user: data.user,
            orderId: data.orderId,
          });
        });

        // Sort di client side untuk sementara
        messages.sort((a, b) => {
          const dateA =
            a.createdAt instanceof Date
              ? a.createdAt
              : (a.createdAt as Timestamp).toDate();
          const dateB =
            b.createdAt instanceof Date
              ? b.createdAt
              : (b.createdAt as Timestamp).toDate();
          return dateB.getTime() - dateA.getTime();
        });

        callback(messages);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error subscribing to messages:", error);
      return () => {};
    }
  }

  /**
   * Get chat participants for an order
   */
  async getChatParticipants(orderId: string): Promise<ChatUser[]> {
    // This would typically be derived from the order data
    // For now, return empty array as participants are determined by order data
    return [];
  }
}

export const chatService = new ChatService();
