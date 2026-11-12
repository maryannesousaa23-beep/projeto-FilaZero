'use client';
import { signOut } from 'next-auth/react';
export default function SignOutButton(){return <button onClick={()=>signOut({callbackUrl:'/'})} className="btn btn-light !py-2">Sair</button>}
