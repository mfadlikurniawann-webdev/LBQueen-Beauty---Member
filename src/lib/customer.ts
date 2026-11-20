export type Customer = {
  id: number;
  name: string;
  phone?: string;
  points: number;
  is_member: boolean;
  membership_type?: string;
  username?: string;
  address?: string | null;
  avatar_url?: string | null;
};
