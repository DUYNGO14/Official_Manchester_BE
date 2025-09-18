import * as bcrypt from 'bcrypt';
const saltRounds = 10;
export const hashPassword = async (password: string) => {
  return await bcrypt.hashSync(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string) => {
  const isMatch = await  bcrypt.compareSync(password, hash);
  return isMatch;
};