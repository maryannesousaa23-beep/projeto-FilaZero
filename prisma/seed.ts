import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
const prisma = new PrismaClient();
async function main(){
  const name=process.env.SEED_ADMIN_NAME||'Administrador FilaZero';
  const email=(process.env.SEED_ADMIN_EMAIL||'admin@filazero.local').toLowerCase();
  const password=process.env.SEED_ADMIN_PASSWORD;
  if(!password || password.length<12) throw new Error('Defina SEED_ADMIN_PASSWORD com pelo menos 12 caracteres no .env antes de executar o seed.');
  const establishmentName=process.env.SEED_ESTABLISHMENT_NAME||'Clínica Central';
  const establishmentAddress=process.env.SEED_ESTABLISHMENT_ADDRESS||'Endereço de demonstração';
  const establishment=await prisma.establishment.upsert({where:{id:'filazero-seed-establishment'},update:{name:establishmentName,address:establishmentAddress},create:{id:'filazero-seed-establishment',name:establishmentName,address:establishmentAddress}});
  const admin=await prisma.user.upsert({where:{email},update:{name,passwordHash:await hash(password,12),role:Role.ADMIN},create:{name,email,passwordHash:await hash(password,12),role:Role.ADMIN}});
  await prisma.staffEstablishment.upsert({where:{userId_establishmentId:{userId:admin.id,establishmentId:establishment.id}},update:{},create:{userId:admin.id,establishmentId:establishment.id}});
  await prisma.service.upsert({where:{id:'filazero-seed-service'},update:{},create:{id:'filazero-seed-service',establishmentId:establishment.id,name:'Atendimento Geral',description:'Atendimento geral e informações',estimatedMinutes:10,codePrefix:'ATD',isActive:true}});
  console.log(`Administrador inicial criado/atualizado: ${email}`);
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(async()=>prisma.$disconnect());
