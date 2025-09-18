import { customAlphabet } from "nanoid";

export const generateCode = async (number: number) => {
  return customAlphabet("0123456789ABCDEFGHJKMNPQRSTVWXYZ", number)();
};
