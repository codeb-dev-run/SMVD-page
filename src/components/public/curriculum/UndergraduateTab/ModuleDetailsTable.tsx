'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { ModuleDetail } from './types';

interface ModuleDetailsTableProps {
  moduleDetails: ModuleDetail[];
}

export default function ModuleDetailsTable({
  moduleDetails,
}: ModuleDetailsTableProps) {
  const t = useTranslations('curriculum.undergraduate');
  const locale = useLocale();
  const isEn = locale === 'en';

  const headingSize = isEn ? 'text-[14px] lg:text-[16px]' : 'text-[14px] lg:text-[18px]';
  const cellSize = isEn ? 'text-[13px] sm:text-[14px] lg:text-[15px]' : 'text-[13px] sm:text-[14px] lg:text-[18px]';
  const cellSizeSm = isEn ? 'text-[13px] lg:text-[15px]' : 'text-[13px] lg:text-[18px]';

  return (
    <>
      {/* Module Details Table Header */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-[320px_1fr_340px] gap-0 w-full mb-0 mt-10">
        <div className={`py-3 px-3 border-b border-neutral-1500 ${headingSize} font-bold text-neutral-1500 font-(family-name:--font-suit) text-left`}>{t('tableHeaders.category')}</div>
        <div className={`py-3 px-3 border-b border-neutral-1500 ${headingSize} font-bold text-neutral-1500 font-(family-name:--font-suit) text-left`}>{t('tableHeaders.description')}</div>
        <div className={`hidden lg:block py-3 px-3 border-b border-neutral-1500 ${headingSize} font-bold text-neutral-1500 font-(family-name:--font-suit) text-left`}>{t('tableHeaders.courses')}</div>
      </div>

      {/* Module Details Rows */}
      <div className="flex flex-col gap-0">
        {moduleDetails.map((detail, index) => {
          return (
            <div
              key={index}
              className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-[320px_1fr_340px] gap-3 sm:gap-0 items-start sm:items-center min-h-auto sm:min-h-[100px] lg:min-h-20 border-b border-t border-neutral-1500 box-border p-4 sm:p-0"
            >
              {/* Module & Title */}
              <div className="flex items-start sm:items-center justify-start p-0 sm:px-3 h-auto sm:h-full gap-0 sm:gap-2 flex-col sm:flex-row w-full sm:w-auto">
                <span className="sm:hidden text-[12px] font-semibold text-[#4e535b] mb-1">
                  {t('mobileLabels.category')}
                </span>
                <p className={`${cellSize} font-bold text-neutral-1500 font-(family-name:--font-suit) m-0 text-left`}>
                  {detail.module}
                </p>
                <p className={`${cellSize} font-medium text-neutral-1500 font-(family-name:--font-suit) m-0 text-left`}>
                  {detail.title}
                </p>
              </div>

              {/* Description */}
              <div className="flex items-start sm:items-center justify-start p-0 sm:px-3 h-auto sm:h-full flex-col sm:flex-row w-full sm:w-auto gap-1 sm:gap-0">
                <span className="sm:hidden text-[12px] font-semibold text-[#4e535b]">
                  {t('mobileLabels.description')}
                </span>
                <p className={`${cellSize} font-medium text-[#353030] font-(family-name:--font-suit) m-0 text-left leading-normal wrap-break-word`}>
                  {detail.description}
                </p>
              </div>

              {/* Courses */}
              <div className="hidden sm:flex items-start justify-start px-3 h-full">
                <p className={`${cellSizeSm} font-medium text-[#353030] font-(family-name:--font-suit) m-0 text-left whitespace-pre-wrap wrap-break-word leading-[1.6]`}>
                  {detail.courses}
                </p>
              </div>

              <div className="flex sm:hidden items-start justify-start p-0 h-auto flex-col w-full gap-1">
                <span className="text-[12px] font-semibold text-[#4e535b]">
                  {t('mobileLabels.courses')}
                </span>
                <p className="text-[13px] font-medium text-[#353030] font-(family-name:--font-suit) m-0 text-left whitespace-pre-wrap wrap-break-word leading-[1.6]">
                  {detail.courses}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
