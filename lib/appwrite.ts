import { Account, Avatars, Client, Databases, ID, Query } from 'react-native-appwrite';
import { User } from './modal';
const client = new Client().setEndpoint('https://cloud.appwrite.io/v1').setProject('683da0f10007b91c6905')  

const databaseId='683da17c00208f88eb3f';
const collectionIdUser="6845301f002eb276b62c";
const account = new Account(client);
const database = new Databases(client);
const avatars = new Avatars(client);

// 登录部分API

const createUser = async (email: string, name: string, user_id: string, avatar_url: string) => {
    try {
        const user = await database.createDocument(databaseId, collectionIdUser, ID.unique(), {
            email,
            name,
            user_id,
            avatar_url
        })
        return user.$id
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const getUserByUserId = async (user_id: string) => {
    try {
        const user = await database.listDocuments(databaseId, collectionIdUser, [Query.equal('user_id', user_id)])
        return user.documents[0]
    } catch (error) {
        console.log('getUserByUserId error', error)
        throw error
    }
}

export const login = async (email: string, password: string) => {
    try {
        const res = await account.createEmailPasswordSession(email, password)
        return res
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const logout = async () => {
    try {
        await account.deleteSession('current')
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const register = async (email: string, password: string, name: string) => {
    try {
        // 1. 注册
        const user = await account.create(ID.unique(), email, password, name)
        const avatarUrl = avatars.getInitials(name)
        const res = await createUser(email, name, user.$id, avatarUrl.toString())
        // 2. 登录
        await login(email, password)
        return user.$id
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const getCurrentUser = async () => {
    const res = await account.get()
    if (res.$id) {
        const user = await getUserByUserId(res.$id)
        return {
            userId: res.$id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatar_url
        } as User
    }

    return null
}