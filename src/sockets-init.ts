import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const socketsInit = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  updateSocketIds: (socketId: string, socket: Socket) => void
) => {
  return io.on("connection", (socket) => {
    console.log("New Socket Connection", socket.id);
    updateSocketIds(socket.id, socket);
    socket.emit("socket-id", socket.id);
  });
};
