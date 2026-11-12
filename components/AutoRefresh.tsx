'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function AutoRefresh({interval=5000}:{interval?:number}){const router=useRouter();useEffect(()=>{const timer=setInterval(()=>router.refresh(),interval);return()=>clearInterval(timer)},[router,interval]);return <span className="text-[11px] text-slate-400">Atualização automática a cada {Math.round(interval/1000)}s</span>}
