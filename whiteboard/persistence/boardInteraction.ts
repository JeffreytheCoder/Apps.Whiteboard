import {
    IPersistence,
    IPersistenceRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";

//functions needed to persist board data while modal and other UI interactions

export const storeBoardRecord = async (
    persistence: IPersistence,
    boardId: string,
    boardData: any,
    messageId: string,
    cover: string,
    title: string,
    privateMessageId: string
): Promise<void> => {
    const boardassociation = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        `${boardId}#BoardName`
    );

    const messageAssociation = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MESSAGE,
        `${messageId}#MessageId`
    );
    await persistence.updateByAssociations(
        [boardassociation, messageAssociation],
        {
            id: boardId,
            boardData: {
                elements: boardData.elements,
                appState: boardData.appState,
                files: boardData.files,
            },
            messageId,
            cover,
            title,
            privateMessageId,
        },
        true
    );
};

export const getBoardRecord = async (
    persistenceRead: IPersistenceRead,
    boardId: string
): Promise<any> => {
    const association = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        `${boardId}#BoardName`
    );
    const result = (await persistenceRead.readByAssociation(
        association
    )) as Array<any>;
    return result && result.length ? result[0] : null;
};

export const getBoardRecordByMessageId = async (
    persistenceRead: IPersistenceRead,
    messageId: string
): Promise<any> => {
    const association = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MESSAGE,
        `${messageId}#MessageId`
    );
    const result = (await persistenceRead.readByAssociation(
        association
    )) as Array<any>;
    return result && result.length ? result[0] : null;
};

export const updateBoardnameByMessageId = async (
    persistence: IPersistence,
    messageId: string,
    boardName: string
): Promise<void> => {
    const association = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MESSAGE,
        `${messageId}#MessageId`
    );
    await persistence.updateByAssociation(
        association,
        {
            title: boardName,
        },
        true
    );
};

export const updatePrivateMessageIdByMessageId = async (
    persistence: IPersistence,
    persistenceRead: IPersistenceRead,
    messageId: string,
    privateMessageId: string
): Promise<void> => {
    let records = await getBoardRecordByMessageId(persistenceRead, messageId);
    if (!records) {
        console.log("No records found");
        return;
    }
    const boardId = records["id"];

    const boardassociation = new RocketChatAssociationRecord(
        RocketChatAssociationModel.USER,
        `${boardId}#BoardName`
    );

    const messageAssociation = new RocketChatAssociationRecord(
        RocketChatAssociationModel.MESSAGE,
        `${messageId}#MessageId`
    );

    records["privateMessageId"] = privateMessageId;
        await persistence.updateByAssociations(
            [boardassociation, messageAssociation],
            records,
            false
    );
};
