import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AnyRecord = Record<string, any> | null | undefined;

interface OnboardingSummaryProps {
  details?: AnyRecord;
  weddingName?: string;
  weddingDate?: string;
  weddingLocation?: string;
  weddingTradition?: string;
  weddingStyle?: string;
}

const OnboardingSummary: React.FC<OnboardingSummaryProps> = ({
  details,
  weddingName,
  weddingDate,
  weddingLocation,
  weddingTradition,
  weddingStyle,
}) => {
  const partnerData = (details as any)?.partner_data || {};
  const ceremonies: string[] = (details as any)?.ceremonies || [];
  const invitedPartnerEmail: string | undefined = (details as any)?.other_partner_email_expected;

  const partners = Object.entries(partnerData) as Array<[
    string,
    { name?: string; role?: string; [k: string]: any }
  ]>;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Onboarding Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Partners</h3>
            {partners.length > 0 ? (
              <ul className="space-y-2">
                {partners.map(([email, p]) => (
                  <li key={email} className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{p?.name || email}</div>
                      <div className="text-xs text-gray-500">{email}</div>
                    </div>
                    {p?.role && (
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{p.role}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Partner details not available yet.</p>
            )}
            {invitedPartnerEmail && (
              <p className="text-xs text-gray-500 mt-3">Invited partner: <span className="font-medium">{invitedPartnerEmail}</span></p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Plan</h3>
            <div className="space-y-1 text-gray-800">
              {weddingName && (
                <div><span className="text-gray-500">Name:</span> {weddingName}</div>
              )}
              {weddingDate && (
                <div><span className="text-gray-500">Date:</span> {weddingDate}</div>
              )}
              {weddingLocation && (
                <div><span className="text-gray-500">Location:</span> {weddingLocation}</div>
              )}
              {weddingTradition && (
                <div><span className="text-gray-500">Tradition:</span> {weddingTradition}</div>
              )}
              {weddingStyle && (
                <div><span className="text-gray-500">Style:</span> {weddingStyle}</div>
              )}
              {ceremonies?.length > 0 && (
                <div className="text-sm">
                  <span className="text-gray-500">Ceremonies:</span>
                  <ul className="list-disc ml-5 mt-1 text-gray-700">
                    {ceremonies.slice(0, 4).map((c, i) => (
                      <li key={`${c}-${i}`}>{c}</li>
                    ))}
                    {ceremonies.length > 4 && (
                      <li className="text-gray-400">+{ceremonies.length - 4} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingSummary;
