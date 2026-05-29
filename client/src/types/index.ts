export interface User {
	id: number;
	username: string;
	display_name: string;
	created_at: string;
}

export interface Chat {
	id: number;
	name: string;
	participant_usernames: string;
	created_at: string;
}

export interface Message {
	id: number;
	chat_id: number;
	sender_id: number;
	sender_username: string;
	sender_display_name: string;
	content: string;
	sent_at: string;
}
