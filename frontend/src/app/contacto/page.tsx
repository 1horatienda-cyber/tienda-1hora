import { MapPin, Clock, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';
import BrandLogos from '@/components/BrandLogos';

function formatPhone(phone: string) {
  // 18095551234 -> 809-555-1234
  const local = phone.startsWith('1') ? phone.slice(1) : phone;
  return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
}

export default async function ContactoPage() {
  const [config, numbers] = await Promise.all([
    api.getStoreConfig().catch(() => null),
    api.getWhatsappNumbers().catch(() => []),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex mb-4">
          <BrandLogos heightClass="h-12" />
        </div>
        <h1 className="text-3xl font-semibold">Contacta tu vendedor</h1>
        <p className="text-gray-500 mt-2">Escríbenos por WhatsApp y te atendemos al instante.</p>
      </div>

      {numbers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {numbers.map((n) => (
            <a
              key={n.phoneNumber}
              href={`https://wa.me/${n.phoneNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-green-200 transition-all"
            >
              <div className="w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                <MessageCircle size={22} className="text-white" />
              </div>
              <div>
                <p className="font-medium">{n.label || 'WhatsApp'}</p>
                <p className="text-gray-500 text-sm">{formatPhone(n.phoneNumber)}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="border border-gray-100 rounded-2xl p-6 space-y-4">
        {config?.address && (
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-brand-accent shrink-0 mt-0.5" />
            <p className="text-gray-700">{config.address}</p>
          </div>
        )}
        {config?.businessHours && (
          <div className="flex items-start gap-3">
            <Clock size={20} className="text-brand-accent shrink-0 mt-0.5" />
            <p className="text-gray-700">{config.businessHours}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center mt-12 opacity-80">
        <BrandLogos heightClass="h-8" />
      </div>
    </div>
  );
}
