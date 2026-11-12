import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { createServiceAction, toggleServiceAction, updateServiceAction } from '@/app/actions';

export default async function ServicesPage({ searchParams }: { searchParams: { erro?: string; salvo?: string; atualizado?: string } }) {
  const user = await requireRole(['ADMIN']);
  const link = await prisma.staffEstablishment.findFirst({ where: { userId: user.id } });
  if (!link) redirect('/dashboard?erro=sem-vinculo');

  const services = await prisma.service.findMany({
    where: { establishmentId: link.establishmentId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="max-w-5xl mx-auto px-5 py-12">
      <p className="eyebrow">Administração</p>
      <h1 className="text-3xl font-black mt-2">Gerenciar serviços</h1>
      <p className="text-slate-500 mt-2">Cadastre, edite e pause os tipos de atendimento oferecidos pelo seu estabelecimento.</p>
      {searchParams.erro && <p className="bg-red-50 text-red-700 p-3 rounded-lg mt-4">{searchParams.erro === 'permissao' ? 'Você não tem permissão para alterar este serviço.' : searchParams.erro === 'sem-estabelecimento' ? 'Sua conta não possui estabelecimento vinculado.' : searchParams.erro}</p>}
      {searchParams.salvo && <p className="bg-emerald-50 text-emerald-700 p-3 rounded-lg mt-4">Serviço cadastrado com sucesso.</p>}
      {searchParams.atualizado && <p className="bg-emerald-50 text-emerald-700 p-3 rounded-lg mt-4">Serviço atualizado com sucesso.</p>}

      <div className="grid md:grid-cols-[.85fr_1.15fr] gap-5 mt-7">
        <section className="panel p-6 h-fit">
          <h2 className="font-black text-lg">Novo serviço</h2>
          <form action={createServiceAction} className="space-y-3 mt-5">
            <label className="block text-sm font-semibold">Nome<input className="field mt-1" name="name" required maxLength={100} placeholder="Atendimento geral" /></label>
            <label className="block text-sm font-semibold">Descrição<textarea className="field mt-1" name="description" rows={3} maxLength={1000} placeholder="Descreva o serviço" /></label>
            <label className="block text-sm font-semibold">Tempo médio (minutos)<input className="field mt-1" type="number" name="estimatedMinutes" min={1} max={240} defaultValue={10} required /></label>
            <label className="block text-sm font-semibold">Prefixo da senha<input className="field mt-1 uppercase" name="codePrefix" minLength={2} maxLength={5} pattern="[A-Z]{2,5}" defaultValue="ATD" required /></label>
            <button className="btn w-full">Cadastrar serviço</button>
          </form>
        </section>

        <section className="panel p-6">
          <h2 className="font-black text-lg">Serviços cadastrados</h2>
          {services.length === 0 ? <p className="text-sm text-slate-400 mt-5">Nenhum serviço cadastrado.</p> : (
            <div className="space-y-4 mt-4">
              {services.map((service) => (
                <div key={service.id} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex justify-between gap-3 items-start">
                    <div><p className="font-bold">{service.name}</p><p className="text-xs text-slate-500 mt-1">{service.estimatedMinutes} min · Prefixo {service.codePrefix}</p></div>
                    <span className={'text-xs rounded-full px-2 py-1 h-fit ' + (service.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500')}>{service.isActive ? 'Ativo' : 'Pausado'}</span>
                  </div>

                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-bold text-blue-600">Editar dados do serviço</summary>
                    <form action={updateServiceAction} className="space-y-3 mt-4">
                      <input type="hidden" name="serviceId" value={service.id} />
                      <label className="block text-sm font-semibold">Nome<input className="field mt-1" name="name" defaultValue={service.name} required maxLength={100} /></label>
                      <label className="block text-sm font-semibold">Descrição<textarea className="field mt-1" name="description" rows={2} defaultValue={service.description || ''} maxLength={1000} /></label>
                      <label className="block text-sm font-semibold">Tempo médio (minutos)<input className="field mt-1" type="number" name="estimatedMinutes" min={1} max={240} defaultValue={service.estimatedMinutes} required /></label>
                      <label className="block text-sm font-semibold">Prefixo da senha<input className="field mt-1 uppercase" name="codePrefix" minLength={2} maxLength={5} pattern="[A-Z]{2,5}" defaultValue={service.codePrefix} required /></label>
                      <button className="btn w-full">Salvar alterações</button>
                    </form>
                  </details>

                  <form action={toggleServiceAction} className="mt-3 pt-3 border-t border-slate-100">
                    <input type="hidden" name="serviceId" value={service.id} />
                    <button className="text-xs font-bold text-blue-600">{service.isActive ? 'Pausar entradas' : 'Ativar serviço'}</button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
