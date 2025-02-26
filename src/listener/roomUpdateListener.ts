import { Messages } from "@mjt-engine/message";
import { Datas, type DATA_EVENT_MAP } from "@mjt-services/data-common-2025";
import { getConnection } from "../getConnection";
import { isDefined, isUndefined } from "@mjt-engine/object";
import { roomsToRoomContents } from "./roomsToRoomContents";
import { findRoomChildren } from "./findRoomChildren";
import { lastRoomContent } from "./lastRoomContent";
import { addRoomTextContent } from "../common/addRoomTextContent";
import { findDaimonsByRoom } from "./findDaimonsByRoom";
import type { RoomContent } from "./RoomContent";
import { Daimons } from "../daimon/Daimons";
import {
  DAIMON_OBJECT_STORE,
  type Daimon,
} from "@mjt-services/daimon-common-2025";

export const roomUpdateListener = async () => {
  Messages.connectEventListenerToSubjectRoot<
    "update",
    typeof DATA_EVENT_MAP,
    Record<string, string>
  >({
    connection: (await getConnection()).connection,
    subjectRoot: "update",
    listener: async (event) => {
      const { root, subpath: parentId } = Messages.parseSubject(event.subject);
      await handleRoomUpdate(parentId);
    },
  });
};

export const handleRoomUpdate = async (roomId: string) => {
  console.log(`Room ${roomId} updated`);
  const roomChildren = await findRoomChildren(roomId);
  const roomContents = await roomsToRoomContents(roomChildren);
  console.log(roomContents);
  const last = lastRoomContent(roomContents);
  if (isUndefined(last)) {
    console.log("No content found");
    return;
  }
  if (isDefined(last.content?.creatorId)) {
    console.log(`Last content NOT created by user`);
    return;
  }
  console.log(`Last content created by user`, last);
  const daimons = (await findDaimonsByRoom(roomId)).toSorted((a, b) => {
    if (a.chara.data.name && b.chara.data.name) {
      return a.chara.data.name.localeCompare(b.chara.data.name);
    }
    return 0;
  });
  for (const daimon of daimons) {
    const roomChildren = await findRoomChildren(roomId);
    const roomContents = await roomsToRoomContents(roomChildren);
    console.log(`Responding as daimon ${daimon.chara.data.name}`);
    await respondAsDaimonToRoomContents({
      roomId,
      daimon,
      roomContents,
    });
  }
};

export const respondAsDaimonToRoomContents = async ({
  roomId,
  daimon,
  roomContents,
}: {
  roomId: string;
  daimon: Daimon;
  roomContents: RoomContent[];
}) => {
  const daimonSystemPrompt = Daimons.daimonToSystemPrompt(daimon);
  console.log(`Daimon system prompt`, daimonSystemPrompt);
  const roomContentsPrompt = await roomContentsToPrompt(roomContents);
  console.log(`Room contents prompt`, roomContentsPrompt);
  const fullSystemPrompt = [
    "# Assistant Description",
    daimonSystemPrompt,
    "# Conversation History",
    roomContentsPrompt,
  ].join("\n");
  console.log(`Full system prompt`, fullSystemPrompt);
  const con = await getConnection();
  const assistantName = daimon.chara.data.name ?? "assistant";
  let finished = false;
  return new Promise((resolve, reject) => {
    con.requestMany({
      subject: "textgen.generate",
      onResponse: async (response) => {
        console.log(`Response`, response);
        if (finished) {
          return;
        }
        if (response.done) {
          finished = true;
          console.log(`Adding content to room ${roomId}`);
          const id = await addRoomTextContent({
            creatorId: daimon.id,
            text: response.text ?? "",
            parentId: roomId,
          });
          console.log(`Added content ${id}`);
          resolve(id);
        }
      },
      request: {
        body: {
          // model: "google/gemini-2.0-flash-001",
          // model: "mistralai/mistral-nemo",
          // model: "google/gemini-flash-1.5",
          model: "gryphe/mythomax-l2-13b",
          stream: true,
          messages: [
            {
              role: "system",
              content: fullSystemPrompt,
            },
            {
              role: "user",
              content: `Give ${assistantName} next response. Begin with '${assistantName}: '`,
            },
          ],
        },
      },
    });
  });
};

export const roomContentsToPrompt = async (roomContents: RoomContent[]) => {
  const allDaimons = await getAllDaimons();
  return roomContents
    .toSorted((a, b) => {
      if (isUndefined(a.content) || isUndefined(b.content)) {
        return 0;
      }
      return a.content.createdAt - b.content.createdAt;
    })
    .map(({ room, content }) => {
      if (isUndefined(content)) {
        console.log(`Content undefined in room ${room.id}`);
        return undefined;
      }
      const { contentType, value, creatorId } = content;
      const daimon = allDaimons.find((daimon) => daimon.id === creatorId);
      if (typeof value !== "string") {
        console.log(`Content not text/plain in room ${room.id}`);
        return undefined;
      }
      const speakerName = daimon?.chara.data.name ?? "user";
      return `${speakerName}: ${value}`;
    })
    .filter(isDefined)
    .join("\n");
};

export const getAllDaimons = async () => {
  return Datas.search(await getConnection())({
    from: DAIMON_OBJECT_STORE,
    query: "values(@)",
  }) as Promise<Daimon[]>;
};
