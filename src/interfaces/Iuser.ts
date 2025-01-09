export interface IUser {
    _id?:object;
    username?: string;
    name?:string;
    email?: string;
    about?:string;
    password?: string;
    gender?: string;
    language?:string;
    profilePicture?: string;
    followers?: string[];
    followings?: string[];
    isOnline?:boolean;
    isAdmin?: boolean;
    desc?: string;
    isBlocked?:boolean;
    created_at?: Date;
}