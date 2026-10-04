import { JpH2 } from '@/components/JpH2';
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Team() {
  const { tr, language } = useLanguage();

  type Member = {
    nameNode: React.ReactNode;
    roleKey: 'member1Role' | 'member2Role' | 'member3Role' | 'member4Role';
    bioKey: 'member1Bio' | 'member2Bio' | 'member3Bio' | 'member4Bio';
  };

  const teamMembers: Member[] = [
    {
      nameNode:
        language === 'jp' ? (
          <><ruby>倉増<rt>クラマス</rt></ruby> アンバー</>
        ) : (
          'Amber Kuramasu'
        ),
      roleKey: 'member1Role',
      bioKey: 'member1Bio',
    },
    {
      nameNode:
        language === 'jp' ? (
          <><ruby>林<rt>ハヤシ</rt></ruby> ジャスティン</>
        ) : (
          'Justin Lin'
        ),
      roleKey: 'member2Role',
      bioKey: 'member2Bio',
    },
    {
      nameNode:
        language === 'jp' ? (
          <><ruby>楊<rt>ヤン</rt></ruby> <ruby>韻琦<rt>ユンチィ</rt></ruby></>
        ) : (
          'Vicky Yang'
        ),
      roleKey: 'member3Role',
      bioKey: 'member3Bio',
    },
    {
      nameNode:
        language === 'jp' ? (
          <>フラビオ</>
        ) : (
          'Flavio'
        ),
      roleKey: 'member4Role',
      bioKey: 'member4Bio',
    },
  ];

  return (
    <section id="team" className="bg-white section-padding section-divider">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="mb-14 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <span className="text-label mb-3 block">
            {tr('team', 'overline')}
          </span>
          <JpH2>
            {tr('team', 'heading')}
          </JpH2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--color-mist)] border border-[var(--color-mist)] rounded-sm overflow-hidden mb-16">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="relative bg-white p-10 flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ animationDelay: `${100 + index * 100}ms` }}
            >
              <h4 className="mb-1 text-base">{member.nameNode}</h4>
              <div className="text-[var(--color-sky)] font-semibold text-xs uppercase tracking-wider mb-4">
                {tr('team', member.roleKey)}
              </div>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                {tr('team', member.bioKey)}
              </p>
            </div>
          ))}
        </div>

        <div className="animate-in fade-in duration-700 delay-300">
          <p className="text-[var(--color-text-muted)] text-sm">
            {tr('team', 'hiring')}
            {' '}
            <a href="mailto:hello@sorta.co.jp" className="text-[var(--color-sky)] hover:underline font-bold" data-testid="link-team-email">
              hello@sorta.co.jp
            </a>
            {language === 'jp' && ' まで。'}
          </p>
        </div>
      </div>
    </section>
  );
}
