import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LeadDetayHeader from '../admin/crm/LeadDetayHeader';
import LeadDetay from '../admin/crm/LeadDetay';
import LeadTakipSayfasi from '../admin/crm/LeadTakipSayfasi';

vi.mock('../admin/crm/LeadDetayGorusmeler', () => ({
  default: () => <div>Görüşmeler İçeriği</div>,
}));
vi.mock('../admin/crm/LeadDetayGorevler', () => ({
  default: () => <div>Görevler İçeriği</div>,
}));
vi.mock('../admin/crm/useCrm', () => ({
  default: () => ({
    leads: [],
    yukleniyor: false,
    leadEkle: vi.fn(),
    leadGuncelle: vi.fn(),
    leadSil: vi.fn(),
    gorusmeEkle: vi.fn(),
    gorevEkle: vi.fn(),
    gorevTamamla: vi.fn(),
  }),
}));
vi.mock('../admin/crm/useTumGorevler', () => ({
  default: () => ({ gorevler: [] }),
}));
vi.mock('../admin/crm/CrmDashboard', () => ({
  default: () => <div>Dashboard</div>,
}));
vi.mock('../admin/crm/LeadKarti', () => ({
  default: () => <div>Lead Kartı</div>,
}));
vi.mock('../admin/crm/LeadEkleModal', () => ({
  default: () => <div>Lead Ekle Modal</div>,
}));
vi.mock('../admin/mali/useMaliVeri', () => ({
  giderEkle: vi.fn(),
}));

const mockS = new Proxy({}, { get: () => '#ccc' });

const mockLead = {
  id: 'lead1',
  adSoyad: 'Ali Veli',
  telefon: '05551234567',
  email: 'ali@test.com',
  kademe: 'WhatsApp',
  durum: 'Aktif',
  kaynak: 'Instagram',
  sorumlu: 'Koç Ali',
  butce: '1000',
  sinavTipi: 'LGS',
  sinif: '8. Sınıf',
  ogrenciyeDonusturuldu: false,
};

const sorumlular = [{ id: 'k1', label: 'Koç Ali' }];

const headerProps = {
  lead: mockLead,
  onKapat: vi.fn(),
  onKademeGuncelle: vi.fn(),
  onDurumGuncelle: vi.fn(),
  onLeadGuncelle: vi.fn(() => Promise.resolve()),
  onLeadSil: vi.fn(),
  sorumlular,
  s: mockS,
};

const detayProps = {
  ...headerProps,
  onGorusmeEkle: vi.fn(),
  onGorevEkle: vi.fn(),
  onGorevTamamla: vi.fn(),
  onOgrenciyeDonustur: vi.fn(),
};

describe('LeadDetayHeader', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lead adını render eder', () => {
    render(<LeadDetayHeader {...headerProps} />);
    expect(screen.getByText('Ali Veli')).toBeInTheDocument();
  });

  it('telefon numarasını gösterir', () => {
    render(<LeadDetayHeader {...headerProps} />);
    expect(screen.getByText('05551234567')).toBeInTheDocument();
  });

  it('e-posta adresini gösterir', () => {
    render(<LeadDetayHeader {...headerProps} />);
    expect(screen.getByText('ali@test.com')).toBeInTheDocument();
  });

  it('düzenle butonuna tıklanınca edit forma geçer', () => {
    render(<LeadDetayHeader {...headerProps} />);
    fireEvent.click(screen.getByTitle('Düzenle'));
    expect(screen.getByPlaceholderText('Ad Soyad')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Telefon')).toBeInTheDocument();
  });

  it('edit moda girilince form lead değerleriyle dolar', () => {
    render(<LeadDetayHeader {...headerProps} />);
    fireEvent.click(screen.getByTitle('Düzenle'));
    expect(screen.getByPlaceholderText('Ad Soyad').value).toBe('Ali Veli');
    expect(screen.getByPlaceholderText('Telefon').value).toBe('05551234567');
  });

  it('iptal butonuna tıklanınca edit mod kapanır', () => {
    render(<LeadDetayHeader {...headerProps} />);
    fireEvent.click(screen.getByTitle('Düzenle'));
    fireEvent.click(screen.getByText('İptal'));
    expect(screen.getByText('Ali Veli')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Ad Soyad')).not.toBeInTheDocument();
  });

  it('sil butonuna tıklanınca window.confirm çağrılır', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<LeadDetayHeader {...headerProps} />);
    fireEvent.click(screen.getByTitle('Sil'));
    expect(confirmSpy).toHaveBeenCalledWith('"Ali Veli" silinecek. Emin misiniz?');
    confirmSpy.mockRestore();
  });

  it('confirm onaylanınca onLeadSil çağrılır', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onLeadSil = vi.fn();
    render(<LeadDetayHeader {...headerProps} onLeadSil={onLeadSil} />);
    fireEvent.click(screen.getByTitle('Sil'));
    expect(onLeadSil).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });

  it('confirm reddedilince onLeadSil çağrılmaz', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onLeadSil = vi.fn();
    render(<LeadDetayHeader {...headerProps} onLeadSil={onLeadSil} />);
    fireEvent.click(screen.getByTitle('Sil'));
    expect(onLeadSil).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('kaynak rozet gösterir', () => {
    render(<LeadDetayHeader {...headerProps} />);
    expect(screen.getByText('Instagram')).toBeInTheDocument();
  });

  it('sorumlu gösterir', () => {
    render(<LeadDetayHeader {...headerProps} />);
    expect(screen.getByText('@Koç Ali')).toBeInTheDocument();
  });
});

describe('LeadTakipSayfasi', () => {
  const crmKullanicilari = [
    { id: 'a1', isim: 'Admin Ali', rol: 'admin' },
    { id: 'f1', isim: 'Finans Ayşe', rol: 'finans' },
  ];

  it('render edilebilir', () => {
    expect(() =>
      render(
        <LeadTakipSayfasi
          s={mockS}
          crmKullanicilari={crmKullanicilari}
          ogrenciEkleAcik_Ac={vi.fn()}
        />
      )
    ).not.toThrow();
  });

  it('dashboard sekmesi başlangıçta aktiftir', () => {
    render(
      <LeadTakipSayfasi
        s={mockS}
        crmKullanicilari={crmKullanicilari}
        ogrenciEkleAcik_Ac={vi.fn()}
      />
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('crmKullanicilari boş array ile hata vermez', () => {
    expect(() =>
      render(<LeadTakipSayfasi s={mockS} crmKullanicilari={[]} ogrenciEkleAcik_Ac={vi.fn()} />)
    ).not.toThrow();
  });
});

describe('LeadDetay', () => {
  beforeEach(() => vi.clearAllMocks());

  it('render edilebilir', () => {
    expect(() => render(<LeadDetay {...detayProps} />)).not.toThrow();
  });

  it('lead adını gösterir', () => {
    render(<LeadDetay {...detayProps} />);
    expect(screen.getByText('Ali Veli')).toBeInTheDocument();
  });

  it('varsayılan sekme görüşmelerdir', () => {
    render(<LeadDetay {...detayProps} />);
    expect(screen.getByText('Görüşmeler İçeriği')).toBeInTheDocument();
  });

  it('görevler sekmesine geçilebilir', () => {
    render(<LeadDetay {...detayProps} />);
    fireEvent.click(screen.getByText('☑️ Görevler'));
    expect(screen.getByText('Görevler İçeriği')).toBeInTheDocument();
  });

  it('kazanıldı + dönüştürülmemişse öğrenciye dönüştür butonu görünür', () => {
    const kazanildiLead = { ...mockLead, kademe: 'Kazanıldı', ogrenciyeDonusturuldu: false };
    render(<LeadDetay {...detayProps} lead={kazanildiLead} />);
    expect(screen.getByText('🎓 Öğrenciye Dönüştür')).toBeInTheDocument();
  });

  it('dönüştürülmüşse tamamlandı mesajı görünür', () => {
    const donusturulmusLead = { ...mockLead, ogrenciyeDonusturuldu: true };
    render(<LeadDetay {...detayProps} lead={donusturulmusLead} />);
    expect(screen.getByText('✅ Bu lead öğrenciye dönüştürüldü')).toBeInTheDocument();
  });
});
