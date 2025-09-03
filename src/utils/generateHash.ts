import bcrypt from 'bcryptjs';

export async function generateHash(password:string) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(hash); 
}
