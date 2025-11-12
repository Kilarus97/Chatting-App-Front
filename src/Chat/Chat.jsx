import React, { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import * as styles from './Chat.scss';

const Chat = () => {
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [username] = useState(() =>
    Math.random().toString(36).substring(2, 6)
  );
  const messageListRef = useRef(null);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5041/chatHub")
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    newConnection.start().then(() => {
      setIsConnected(true);
      console.log("Connected as", username);

      newConnection.on("ReceiveMessage", (user, message) => {
        setMessages(prev => [...prev, { user, message }]);

        setTimeout(() => {
          if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
          }
        }, 100);
      });
    });

    return () => {
      newConnection.stop();
    };
  }, [username]);

  const sendMessage = async () => {
    if (connection && input.trim()) {
      await connection.invoke("SendMessage", username, input);
      setInput('');
    }
  };

  return (
    <div className='container'>
      <div className='header'>
        Korisnik: <strong>{username}</strong>
      </div>
      <div className='status'>
        Status: {isConnected ? 'Povezan' : 'Nije povezan'}
      </div>
      <div className='messageList' ref={messageListRef}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.user === username ? 'myMessage' : 'otherMessage'
            }
          >
            <strong>{m.user}:</strong> {m.message}
          </div>
        ))}
      </div>
      <div className='inputArea'>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Unesi poruku..."
          className='input'
        />
        <button onClick={sendMessage} className='button'>
          Pošalji
        </button>
      </div>
    </div>
  );
};

export default Chat;
