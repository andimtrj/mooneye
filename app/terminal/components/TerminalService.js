"use client";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

class TerminalService {
  constructor(db, auth, user, router, setHistory) {
    this.db = db;
    this.auth = auth;
    this.user = user;
    this.router = router;
    this.setHistory = setHistory;
  }

  async saveCommand(command) {
    try {
      await addDoc(collection(this.db, "commands"), {
        userId: this.user.uid,
        command: command,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving command: ", error);
    }
  }

  processCommand(command) {
    const cmd = command.toLowerCase();

    if (cmd === "help") {
      this.showHelp();
    } else if (cmd === "clear") {
      this.clearTerminal();
    } else if (cmd === "whoami") {
      this.showUserInfo();
    } else if (cmd === "date") {
      this.showDate();
    } else if (cmd === "history") {
      this.fetchCommandHistory();
    } else if (cmd === "history clear") {
      this.clearCommandHistory(false);
    } else if (cmd === "history clear confirm") {
      this.clearCommandHistory(true);
    } else if (cmd === "signout" || cmd === "logout" || cmd === "exit") {
      this.handleSignOut();
    } else {
      this.commandNotFound(command);
    }
  }

  showHelp() {
    const helpText = `
Available commands:
- help: Show this help message
- clear: Clear the terminal display
- whoami: Display your user information
- date: Show current date and time
- history: Show your command history
- history clear: Delete your command history (cannot be undone)
- signout: Sign out and return to login screen
    `;
    this.setHistory((prev) => [...prev, { type: "response", text: helpText }]);
  }

  clearTerminal() {
    this.setHistory([]);
  }

  showUserInfo() {
    this.setHistory((prev) => [
      ...prev,
      {
        type: "response",
        text: `Current user: ${this.user.name || this.user.email}`,
      },
    ]);
  }

  showDate() {
    this.setHistory((prev) => [
      ...prev,
      {
        type: "response",
        text: `Current date: ${new Date().toLocaleString()}`,
      },
    ]);
  }

  commandNotFound(command) {
    this.setHistory((prev) => [
      ...prev,
      {
        type: "response",
        text: `Command not found: ${command}. Type 'help' for available commands.`,
      },
    ]);
  }

  async fetchCommandHistory() {
    this.setHistory((prev) => [
      ...prev,
      { type: "response", text: "Fetching command history..." },
    ]);

    try {
      // Method 1: Try with the needed compound index
      try {
        const commandsQuery = query(
          collection(this.db, "commands"),
          where("userId", "==", this.user.uid),
          orderBy("timestamp", "desc"),
          limit(20)
        );

        const querySnapshot = await getDocs(commandsQuery);

        if (querySnapshot.empty) {
          this.setHistory((prev) => [
            ...prev,
            { type: "response", text: "No command history found." },
          ]);
          return;
        }

        let historyText = "Command History (recent 20):\n";

        querySnapshot.forEach((doc, index) => {
          const data = doc.data();
          const date = data.timestamp
            ? new Date(data.timestamp.toDate()).toLocaleString()
            : "Unknown date";
          historyText += `${index + 1}. ${data.command} (${date})\n`;
        });

        this.setHistory((prev) => [
          ...prev,
          { type: "response", text: historyText },
        ]);
      } catch (indexError) {
        // Check if this is an index error
        if (
          indexError.code === "failed-precondition" &&
          indexError.message.includes("requires an index")
        ) {
          // Extract the URL from the error message
          const urlMatch = indexError.message.match(
            /https:\/\/console\.firebase\.google\.com\/[^\s]+/
          );
          const indexUrl = urlMatch ? urlMatch[0] : "";

          this.setHistory((prev) => [
            ...prev,
            {
              type: "response",
              text:
                "This query requires a special index in Firebase. Please create the index by visiting the Firebase Console.\n\n" +
                "You need to create an index on the 'commands' collection with these fields:\n" +
                "- userId (Ascending)\n" +
                "- timestamp (Descending)\n\n" +
                "You can create it by clicking this link (requires admin access):\n" +
                indexUrl +
                "\n\n" +
                "Meanwhile, showing unordered history:",
            },
          ]);

          // Fall back to a simpler query without ordering
          const simpleQuery = query(
            collection(this.db, "commands"),
            where("userId", "==", this.user.uid),
            limit(20)
          );

          const fallbackSnapshot = await getDocs(simpleQuery);

          if (fallbackSnapshot.empty) {
            this.setHistory((prev) => [
              ...prev,
              { type: "response", text: "No command history found." },
            ]);
            return;
          }

          // Convert to array, then sort in JavaScript
          const commands = [];
          fallbackSnapshot.forEach((doc) => {
            const data = doc.data();
            commands.push({
              command: data.command,
              timestamp: data.timestamp ? data.timestamp.toDate() : new Date(0),
            });
          });

          // Sort by timestamp
          commands.sort((a, b) => b.timestamp - a.timestamp);

          let historyText =
            "Command History (recent 20, client-side sorted):\n";
          commands.forEach((item, index) => {
            historyText += `${index + 1}. ${
              item.command
            } (${item.timestamp.toLocaleString()})\n`;
          });

          this.setHistory((prev) => [
            ...prev,
            { type: "response", text: historyText },
          ]);
        } else {
          // Re-throw if it's not an index error
          throw indexError;
        }
      }
    } catch (error) {
      console.error("Error fetching command history:", error);
      this.setHistory((prev) => [
        ...prev,
        {
          type: "response",
          text: `Error fetching command history: ${error.message}. Please try again.`,
        },
      ]);
    }
  }

  async clearCommandHistory(confirmed = false) {
    if (!confirmed) {
      this.setHistory((prev) => [
        ...prev,
        {
          type: "response",
          text: "Are you sure you want to clear all command history? This cannot be undone. Type 'history clear confirm' to confirm.",
        },
      ]);
      return;
    }

    this.setHistory((prev) => [
      ...prev,
      { type: "response", text: "Clearing command history..." },
    ]);

    try {
      const commandsQuery = query(
        collection(this.db, "commands"),
        where("userId", "==", this.user.uid)
      );

      const querySnapshot = await getDocs(commandsQuery);

      if (querySnapshot.empty) {
        this.setHistory((prev) => [
          ...prev,
          { type: "response", text: "No command history to clear." },
        ]);
      } else {
        let deleteCount = 0;

        const deletePromises = querySnapshot.docs.map(async (document) => {
          await deleteDoc(doc(this.db, "commands", document.id));
          deleteCount++;
        });

        await Promise.all(deletePromises);

        this.setHistory((prev) => [
          ...prev,
          {
            type: "response",
            text: `Successfully deleted ${deleteCount} command${
              deleteCount !== 1 ? "s" : ""
            } from history.`,
          },
        ]);
      }
    } catch (error) {
      console.error("Error clearing command history:", error);
      this.setHistory((prev) => [
        ...prev,
        {
          type: "response",
          text: "Error clearing command history. Please try again.",
        },
      ]);
    }
  }

  async handleSignOut() {
    this.setHistory((prev) => [
      ...prev,
      { type: "response", text: "Signing out..." },
    ]);

    try {
      await signOut(this.auth);
      this.setHistory((prev) => [
        ...prev,
        { type: "response", text: "Sign out successful. Redirecting..." },
      ]);

      // Redirect setelah jeda singkat agar pesan terlihat
      setTimeout(() => {
        this.router.push("/signin");
      }, 1500);
    } catch (error) {
      console.error("Error signing out:", error);
      this.setHistory((prev) => [
        ...prev,
        { type: "response", text: "Error signing out: " + error.message },
      ]);
    }
  }
}

export default TerminalService;
