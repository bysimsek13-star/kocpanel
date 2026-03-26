import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, updateDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const renkler = ['#A09DFF','#34C98A','#FF6B6B','#FFA040','#60a5fa','#f472b6'];
const s = {
  bg:'#0C0E14',surface:'#14151F',surface2:'#1C1D2C',
  border:'#2A2B3D',accent:'#7C6EFA',accentSoft:'rgba(124,110,250,0.15)',
  text:'#ffffff',text2:'#8E90AD',text3:'#4E5070',
};

const TYT_DERSLER=[{id:'tur',label:'Türkçe',toplam:40,renk:'#FFA040'},{id:'mat',label:'Temel Matematik',toplam:40,renk:'#7C6EFA'},{id:'fen',label:'Fen Bilimleri',toplam:20,renk:'#34C98A'},{id:'sos',label:'Sosyal Bilimler',toplam:20,renk:'#FF6B6B'}];
const AYT_DERSLER=[{id:'mat',label:'Matematik',toplam:30,renk:'#7C6EFA'},{id:'fiz',label:'Fizik',toplam:14,renk:'#60a5fa'},{id:'kim',label:'Kimya',toplam:13,renk:'#34C98A'},{id:'biy',label:'Biyoloji',toplam:13,renk:'#f472b6'},{id:'ede',label:'Edebiyat',toplam:24,renk:'#FFA040'},{id:'tar',label:'Tarih',toplam:10,renk:'#FF6B6B'},{id:'cog',label:'Coğrafya',toplam:6,renk:'#a78bfa'}];

function netHesapla(d,y){return Math.max(0,d-(y/4)).toFixed(2);}
function verimlilikHesapla(c,b,g){if(b===0)return 0;const o=Math.min(c/b,1.5);return Math.min(Math.round(((o+g/100)/2)*100),100);}
function verimlilikDurum(v){
  if(v<=20)return{emoji:'🔴',label:'Çalışmadı',renk:'#FF6B6B'};
  if(v<=40)return{emoji:'🟠',label:'Yetersiz',renk:'#FF8C42'};
  if(v<=60)return{emoji:'🟡',label:'Orta',renk:'#FFA040'};
  if(v<=80)return{emoji:'🟢',label:'İyi',renk:'#34C98A'};
  return{emoji:'💎',label:'Mükemmel',renk:'#A09DFF'};
}

// ===== MESAJLAŞMA =====
function MesajEkrani({ogrenciId,gonderen}){
  const[mesajlar,setMesajlar]=useState([]);
  const[yeniMesaj,setYeniMesaj]=useState('');
  const[yukleniyor,setYukleniyor]=useState(false);
  const getir=async()=>{
    try{const snap=await getDocs(collection(db,'ogrenciler',ogrenciId,'mesajlar'));
    const liste=snap.docs.map(d=>({id:d.id,...d.data()}));
    liste.sort((a,b)=>(a.olusturma?.seconds||0)-(b.olusturma?.seconds||0));
    setMesajlar(liste);}catch(e){console.log(e);}
  };
  useEffect(()=>{getir();},[ogrenciId]);
  const gonder=async()=>{
    if(!yeniMesaj.trim())return;
    setYukleniyor(true);
    try{await addDoc(collection(db,'ogrenciler',ogrenciId,'mesajlar'),{mesaj:yeniMesaj,gonderen,olusturma:new Date()});setYeniMesaj('');await getir();}catch(e){alert(e.message);}
    setYukleniyor(false);
  };
  return(
    <div style={{display:'flex',flexDirection:'column',height:'500px',background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
        {mesajlar.length===0?<div style={{textAlign:'center',padding:'40px',color:s.text3}}><div style={{fontSize:'32px',marginBottom:'8px'}}>💬</div><div style={{fontSize:'13px'}}>Henüz mesaj yok</div></div>:
        mesajlar.map(m=>{const benim=m.gonderen===gonderen;return(
          <div key={m.id} style={{display:'flex',flexDirection:'column',alignItems:benim?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'75%',background:benim?s.accentSoft:s.surface2,border:`1px solid ${benim?s.accent:s.border}`,borderRadius:benim?'16px 16px 4px 16px':'16px 16px 16px 4px',padding:'10px 14px'}}>
              <div style={{fontSize:'13px',color:s.text,lineHeight:'1.5'}}>{m.mesaj}</div>
            </div>
            <div style={{fontSize:'10.5px',color:s.text3,marginTop:'3px'}}>
              <span style={{color:benim?'#A09DFF':'#34C98A',fontWeight:'600'}}>{m.gonderen==='koc'?'Koç':'Öğrenci'}</span>
              {' · '}{m.olusturma?.toDate?m.olusturma.toDate().toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}):''}
            </div>
          </div>
        );})}
      </div>
      <div style={{padding:'12px 16px',borderTop:`1px solid ${s.border}`,display:'flex',gap:'10px'}}>
        <input value={yeniMesaj} onChange={e=>setYeniMesaj(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&gonder()} placeholder="Mesaj yaz... (Enter)" style={{flex:1,background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'10px 14px',color:s.text,fontSize:'13px',outline:'none'}}/>
        <button onClick={gonder} disabled={!yeniMesaj.trim()||yukleniyor} style={{padding:'10px 18px',background:yeniMesaj.trim()?s.accentSoft:'#2A2B3D',border:yeniMesaj.trim()?`2px solid ${s.accent}`:`1px solid ${s.border}`,color:yeniMesaj.trim()?'#A09DFF':s.text3,borderRadius:'10px',cursor:yeniMesaj.trim()?'pointer':'not-allowed',fontSize:'13px',fontWeight:'700'}}>
          {yukleniyor?'...':'Gönder →'}
        </button>
      </div>
    </div>
  );
}

// ===== KOÇ MESAJLAR SAYFASI =====
function KocMesajlarSayfasi({ogrenciler,onGeri}){
  const[secili,setSecili]=useState(ogrenciler[0]||null);
  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif',display:'flex',flexDirection:'column'}}>
      <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'16px 28px',display:'flex',alignItems:'center',gap:'14px'}}>
        <div onClick={onGeri} style={{background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'13px'}}>← Geri</div>
        <div style={{fontSize:'18px',fontWeight:'700',color:s.text}}>💬 Mesajlar</div>
        <div style={{fontSize:'13px',color:s.text2,marginLeft:'8px'}}>Öğrenciyi seçip mesajlaş</div>
      </div>
      <div style={{flex:1,display:'grid',gridTemplateColumns:'280px 1fr',minHeight:'calc(100vh - 60px)'}}>
        <div style={{background:s.surface,borderRight:`1px solid ${s.border}`,overflowY:'auto'}}>
          <div style={{padding:'14px 16px',borderBottom:`1px solid ${s.border}`,fontSize:'12px',color:s.text3,fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.8px'}}>Öğrenciler</div>
          {ogrenciler.length===0?<div style={{padding:'20px',textAlign:'center',color:s.text3,fontSize:'13px'}}>Öğrenci yok</div>:
          ogrenciler.map((o,i)=>(
            <div key={o.id} onClick={()=>setSecili(o)} style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 16px',borderBottom:`1px solid ${s.border}`,cursor:'pointer',background:secili?.id===o.id?s.accentSoft:'transparent'}}>
              <div style={{width:'38px',height:'38px',borderRadius:'50%',background:renkler[i%renkler.length]+'33',display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'13px',flexShrink:0}}>
                {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div style={{flex:1}}>
                <div style={{color:secili?.id===o.id?'#A09DFF':s.text,fontSize:'13.5px',fontWeight:'500'}}>{o.isim}</div>
                <div style={{color:s.text3,fontSize:'11.5px'}}>{o.tur}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:'20px',background:s.bg}}>
          {secili?<MesajEkrani ogrenciId={secili.id} gonderen="koc"/>:
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:s.text3,fontSize:'14px'}}>Soldaki listeden öğrenci seç</div>}
        </div>
      </div>
    </div>
  );
}

// ===== HAFTALIK PROGRAM SAYFASI =====
function HaftalikProgramSayfasi({ogrenciler,onGeri}){
  const[veriler,setVeriler]=useState({});
  const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{
      const obj={};
      for(const o of ogrenciler){
        try{const snap=await getDocs(collection(db,'ogrenciler',o.id,'program'));
        obj[o.id]=snap.docs.map(d=>({id:d.id,...d.data()}));}catch(e){}
      }
      setVeriler(obj);setYukleniyor(false);
    };
    getir();
  },[]);
  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif'}}>
      <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'16px 28px',display:'flex',alignItems:'center',gap:'14px'}}>
        <div onClick={onGeri} style={{background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'13px'}}>← Geri</div>
        <div style={{fontSize:'18px',fontWeight:'700',color:s.text}}>📅 Haftalık Program</div>
      </div>
      <div style={{padding:'28px'}}>
        {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'16px'}}>
          {ogrenciler.map((o,i)=>{
            const prog=veriler[o.id]||[];
            const tam=prog.filter(p=>p.tamamlandi).length;
            const oran=prog.length>0?Math.round((tam/prog.length)*100):0;
            return(
              <div key={o.id} style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',overflow:'hidden'}}>
                <div style={{padding:'14px 16px',borderBottom:`1px solid ${s.border}`,display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'50%',background:renkler[i%renkler.length]+'33',display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'12px'}}>
                    {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{color:s.text,fontSize:'13.5px',fontWeight:'600'}}>{o.isim}</div>
                    <div style={{color:s.text2,fontSize:'11px'}}>{o.tur}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'18px',fontWeight:'700',color:oran>=80?'#34C98A':oran>=50?'#FFA040':'#FF6B6B'}}>{oran}%</div>
                    <div style={{fontSize:'10px',color:s.text3}}>{tam}/{prog.length}</div>
                  </div>
                </div>
                <div style={{padding:'12px 16px'}}>
                  <div style={{height:'6px',background:s.surface2,borderRadius:'6px',overflow:'hidden',marginBottom:'10px'}}>
                    <div style={{height:'100%',width:oran+'%',background:oran>=80?'#34C98A':oran>=50?'#FFA040':'#FF6B6B',borderRadius:'6px'}}/>
                  </div>
                  {prog.length===0?<div style={{color:s.text3,fontSize:'12px',textAlign:'center',padding:'8px'}}>Program henüz eklenmedi</div>:
                  prog.slice(0,4).map(p=>(
                    <div key={p.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 0',borderBottom:`1px solid ${s.border}`}}>
                      <div style={{width:'16px',height:'16px',borderRadius:'4px',background:p.tamamlandi?'#34C98A':s.surface2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',color:'white',flexShrink:0}}>{p.tamamlandi&&'✓'}</div>
                      <div style={{flex:1,fontSize:'12px',color:p.tamamlandi?s.text3:s.text,textDecoration:p.tamamlandi?'line-through':'none'}}>{p.gorev}</div>
                      <div style={{fontSize:'10px',color:s.text3}}>{p.ders}</div>
                    </div>
                  ))}
                  {prog.length>4&&<div style={{fontSize:'11px',color:s.text3,textAlign:'center',marginTop:'8px'}}>+{prog.length-4} görev daha</div>}
                </div>
              </div>
            );
          })}
        </div>}
      </div>
    </div>
  );
}

// ===== GÜNLÜK TAKİP SAYFASI =====
function GunlukTakipSayfasi({ogrenciler,onGeri}){
  const bugun=new Date().toISOString().split('T')[0];
  const[veriler,setVeriler]=useState({});
  const[calisma,setCalisma]=useState({});
  const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{
      const progObj={},calObj={};
      for(const o of ogrenciler){
        try{
          const snap=await getDocs(collection(db,'ogrenciler',o.id,'program'));
          progObj[o.id]=snap.docs.map(d=>({id:d.id,...d.data()}));
          const calSnap=await getDoc(doc(db,'ogrenciler',o.id,'calisma',bugun));
          if(calSnap.exists())calObj[o.id]=calSnap.data();
        }catch(e){}
      }
      setVeriler(progObj);setCalisma(calObj);setYukleniyor(false);
    };
    getir();
  },[]);
  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif'}}>
      <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'16px 28px',display:'flex',alignItems:'center',gap:'14px'}}>
        <div onClick={onGeri} style={{background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'13px'}}>← Geri</div>
        <div style={{fontSize:'18px',fontWeight:'700',color:s.text}}>✅ Günlük Takip</div>
        <div style={{fontSize:'13px',color:s.text2}}>{bugun}</div>
      </div>
      <div style={{padding:'28px'}}>
        {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:
        <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 100px 100px 100px 120px',gap:'0',padding:'12px 20px',borderBottom:`1px solid ${s.border}`,background:s.surface2}}>
            <div style={{fontSize:'11px',color:s.text3,fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.8px'}}>Öğrenci</div>
            <div style={{fontSize:'11px',color:s.text3,fontWeight:'600',textTransform:'uppercase',textAlign:'center'}}>Görev</div>
            <div style={{fontSize:'11px',color:s.text3,fontWeight:'600',textTransform:'uppercase',textAlign:'center'}}>Tamamlama</div>
            <div style={{fontSize:'11px',color:s.text3,fontWeight:'600',textTransform:'uppercase',textAlign:'center'}}>Çalışma</div>
            <div style={{fontSize:'11px',color:s.text3,fontWeight:'600',textTransform:'uppercase',textAlign:'center'}}>Verimlilik</div>
          </div>
          {ogrenciler.map((o,i)=>{
            const prog=veriler[o.id]||[];
            const tam=prog.filter(p=>p.tamamlandi).length;
            const oran=prog.length>0?Math.round((tam/prog.length)*100):0;
            const cal=calisma[o.id];
            const ver=cal?verimlilikDurum(cal.verimlilik):null;
            return(
              <div key={o.id} style={{display:'grid',gridTemplateColumns:'1fr 100px 100px 100px 120px',gap:'0',padding:'14px 20px',borderBottom:`1px solid ${s.border}`,alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'50%',background:renkler[i%renkler.length]+'33',display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'12px'}}>
                    {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <div style={{color:s.text,fontSize:'13.5px',fontWeight:'500'}}>{o.isim}</div>
                    <div style={{color:s.text2,fontSize:'11px'}}>{o.tur}</div>
                  </div>
                </div>
                <div style={{textAlign:'center',fontSize:'13px',color:s.text2}}>{tam}/{prog.length}</div>
                <div style={{textAlign:'center'}}>
                  <div style={{fontSize:'14px',fontWeight:'700',color:oran>=80?'#34C98A':oran>=50?'#FFA040':'#FF6B6B'}}>{oran}%</div>
                </div>
                <div style={{textAlign:'center',fontSize:'13px',color:cal?s.text:s.text3}}>{cal?cal.saat+'s':'—'}</div>
                <div style={{textAlign:'center'}}>
                  {ver?<div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}>
                    <span style={{fontSize:'16px'}}>{ver.emoji}</span>
                    <span style={{fontSize:'12px',fontWeight:'600',color:ver.renk}}>{ver.label}</span>
                  </div>:<div style={{fontSize:'12px',color:s.text3}}>Giriş yok</div>}
                </div>
              </div>
            );
          })}
        </div>}
      </div>
    </div>
  );
}

// ===== DENEME YÖNETİMİ SAYFASI =====
function DenemeYonetimiSayfasi({ogrenciler,onGeri}){
  const[veriler,setVeriler]=useState({});
  const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{
      const obj={};
      for(const o of ogrenciler){
        try{const snap=await getDocs(collection(db,'ogrenciler',o.id,'denemeler'));
        const liste=snap.docs.map(d=>({id:d.id,...d.data()}));
        liste.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));
        obj[o.id]=liste;}catch(e){}
      }
      setVeriler(obj);setYukleniyor(false);
    };
    getir();
  },[]);
  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif'}}>
      <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'16px 28px',display:'flex',alignItems:'center',gap:'14px'}}>
        <div onClick={onGeri} style={{background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'13px'}}>← Geri</div>
        <div style={{fontSize:'18px',fontWeight:'700',color:s.text}}>📊 Deneme Yönetimi</div>
      </div>
      <div style={{padding:'28px'}}>
        {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'16px'}}>
          {ogrenciler.map((o,i)=>{
            const denemeler=veriler[o.id]||[];
            const son=denemeler[0];
            const onceki=denemeler[1];
            const fark=son&&onceki?( parseFloat(son.toplamNet)-parseFloat(onceki.toplamNet)).toFixed(1):null;
            return(
              <div key={o.id} style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',overflow:'hidden'}}>
                <div style={{padding:'14px 16px',borderBottom:`1px solid ${s.border}`,display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'50%',background:renkler[i%renkler.length]+'33',display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'12px'}}>
                    {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{color:s.text,fontSize:'13.5px',fontWeight:'600'}}>{o.isim}</div>
                    <div style={{color:s.text2,fontSize:'11px'}}>{denemeler.length} deneme</div>
                  </div>
                  {son&&<div style={{textAlign:'right'}}>
                    <div style={{fontSize:'22px',fontWeight:'700',color:'#A09DFF'}}>{son.toplamNet}</div>
                    <div style={{fontSize:'10px',color:s.text3}}>{son.sinav} net</div>
                  </div>}
                </div>
                <div style={{padding:'12px 16px'}}>
                  {denemeler.length===0?<div style={{color:s.text3,fontSize:'12px',textAlign:'center',padding:'12px'}}>Deneme sonucu yok</div>:
                  <>
                    {fark!==null&&<div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'10px',padding:'8px 12px',background:parseFloat(fark)>=0?'rgba(52,201,138,0.1)':'rgba(255,107,107,0.1)',borderRadius:'8px',border:`1px solid ${parseFloat(fark)>=0?'#34C98A':'#FF6B6B'}`}}>
                      <span style={{fontSize:'14px'}}>{parseFloat(fark)>=0?'📈':'📉'}</span>
                      <span style={{fontSize:'13px',fontWeight:'600',color:parseFloat(fark)>=0?'#34C98A':'#FF6B6B'}}>
                        {parseFloat(fark)>=0?'+':''}{fark} net değişim
                      </span>
                    </div>}
                    {denemeler.slice(0,3).map(d=>(
                      <div key={d.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 0',borderBottom:`1px solid ${s.border}`}}>
                        <div style={{background:s.accentSoft,color:'#A09DFF',padding:'2px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{d.sinav}</div>
                        <div style={{fontSize:'12px',color:s.text2,flex:1}}>{d.tarih}</div>
                        <div style={{fontSize:'15px',fontWeight:'700',color:'#A09DFF'}}>{d.toplamNet}</div>
                      </div>
                    ))}
                  </>}
                </div>
              </div>
            );
          })}
        </div>}
      </div>
    </div>
  );
}

// ===== İSTATİSTİKLER SAYFASI =====
function IstatistiklerSayfasi({ogrenciler,onGeri}){
  const[veriler,setVeriler]=useState({prog:{},den:{},cal:{}});
  const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{
      const prog={},den={},cal={};
      for(const o of ogrenciler){
        try{
          const ps=await getDocs(collection(db,'ogrenciler',o.id,'program'));
          prog[o.id]=ps.docs.map(d=>({id:d.id,...d.data()}));
          const ds=await getDocs(collection(db,'ogrenciler',o.id,'denemeler'));
          den[o.id]=ds.docs.map(d=>({id:d.id,...d.data()}));
          const cs=await getDocs(collection(db,'ogrenciler',o.id,'calisma'));
          cal[o.id]=cs.docs.map(d=>({tarih:d.id,...d.data()}));
        }catch(e){}
      }
      setVeriler({prog,den,cal});setYukleniyor(false);
    };
    getir();
  },[]);

  const toplamOgrenci=ogrenciler.length;
  const ortTamamlama=toplamOgrenci>0?Math.round(ogrenciler.reduce((acc,o)=>{
    const p=veriler.prog[o.id]||[];
    const t=p.filter(x=>x.tamamlandi).length;
    return acc+(p.length>0?Math.round((t/p.length)*100):0);
  },0)/toplamOgrenci):0;
  const toplamDeneme=Object.values(veriler.den).reduce((a,v)=>a+v.length,0);
  const ortCalisma=toplamOgrenci>0?Math.round(Object.values(veriler.cal).reduce((a,v)=>a+v.reduce((b,c)=>b+(c.saat||0),0),0)/toplamOgrenci*10)/10:0;

  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif'}}>
      <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'16px 28px',display:'flex',alignItems:'center',gap:'14px'}}>
        <div onClick={onGeri} style={{background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'13px'}}>← Geri</div>
        <div style={{fontSize:'18px',fontWeight:'700',color:s.text}}>📈 İstatistikler</div>
      </div>
      <div style={{padding:'28px'}}>
        {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:<>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'24px'}}>
          {[
            {label:'Toplam Öğrenci',value:toplamOgrenci,renk:'#A09DFF',icon:'👥'},
            {label:'Ort. Program Tamamlama',value:'%'+ortTamamlama,renk:'#34C98A',icon:'✅'},
            {label:'Toplam Deneme',value:toplamDeneme,renk:'#FFA040',icon:'📊'},
            {label:'Ort. Çalışma Saati',value:ortCalisma+'s',renk:'#60a5fa',icon:'⏱️'},
          ].map(k=>(
            <div key={k.label} style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'14px',padding:'20px'}}>
              <div style={{fontSize:'24px',marginBottom:'8px'}}>{k.icon}</div>
              <div style={{fontSize:'11px',color:s.text2,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'6px'}}>{k.label}</div>
              <div style={{fontSize:'32px',fontWeight:'700',color:k.renk}}>{k.value}</div>
            </div>
          ))}
        </div>

        <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',padding:'20px',marginBottom:'20px'}}>
          <div style={{fontWeight:'600',fontSize:'14px',color:s.text,marginBottom:'16px'}}>📊 Öğrenci Bazlı Program Tamamlama</div>
          {ogrenciler.map((o,i)=>{
            const p=veriler.prog[o.id]||[];
            const t=p.filter(x=>x.tamamlandi).length;
            const oran=p.length>0?Math.round((t/p.length)*100):0;
            return(
              <div key={o.id} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
                <div style={{width:'120px',fontSize:'13px',color:s.text,fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.isim}</div>
                <div style={{flex:1,height:'10px',background:s.surface2,borderRadius:'10px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:oran+'%',background:renkler[i%renkler.length],borderRadius:'10px',transition:'width 0.5s'}}/>
                </div>
                <div style={{fontSize:'13px',fontWeight:'700',color:renkler[i%renkler.length],width:'40px',textAlign:'right'}}>{oran}%</div>
              </div>
            );
          })}
        </div>

        <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',padding:'20px'}}>
          <div style={{fontWeight:'600',fontSize:'14px',color:s.text,marginBottom:'16px'}}>📈 Öğrenci Bazlı Son Deneme Netleri</div>
          {ogrenciler.map((o,i)=>{
            const d=veriler.den[o.id]||[];
            d.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));
            const son=d[0];
            const maxNet=120;
            const oran=son?Math.round((parseFloat(son.toplamNet)/maxNet)*100):0;
            return(
              <div key={o.id} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px'}}>
                <div style={{width:'120px',fontSize:'13px',color:s.text,fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.isim}</div>
                <div style={{flex:1,height:'10px',background:s.surface2,borderRadius:'10px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:oran+'%',background:'#A09DFF',borderRadius:'10px'}}/>
                </div>
                <div style={{fontSize:'13px',fontWeight:'700',color:'#A09DFF',width:'60px',textAlign:'right'}}>{son?son.toplamNet+' net':'—'}</div>
              </div>
            );
          })}
        </div>
        </>}
      </div>
    </div>
  );
}

// ===== HEDEF TAKİBİ SAYFASI =====
function HedefTakibiSayfasi({ogrenciler,onGeri}){
  const[hedefler,setHedefler]=useState({});
  const[yeniHedef,setYeniHedef]=useState({});
  const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{
      const obj={};
      for(const o of ogrenciler){
        try{const snap=await getDocs(collection(db,'ogrenciler',o.id,'hedefler'));
        obj[o.id]=snap.docs.map(d=>({id:d.id,...d.data()}));}catch(e){}
      }
      setHedefler(obj);setYukleniyor(false);
    };
    getir();
  },[]);

  const hedefEkle=async(ogrenciId)=>{
    const h=yeniHedef[ogrenciId];
    if(!h?.baslik||!h?.deger)return;
    try{
      await addDoc(collection(db,'ogrenciler',ogrenciId,'hedefler'),{baslik:h.baslik,deger:h.deger,olusturma:new Date()});
      setYeniHedef(prev=>({...prev,[ogrenciId]:{baslik:'',deger:''}}));
      const snap=await getDocs(collection(db,'ogrenciler',ogrenciId,'hedefler'));
      setHedefler(prev=>({...prev,[ogrenciId]:snap.docs.map(d=>({id:d.id,...d.data()}))}));
    }catch(e){alert(e.message);}
  };

  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif'}}>
      <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'16px 28px',display:'flex',alignItems:'center',gap:'14px'}}>
        <div onClick={onGeri} style={{background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'13px'}}>← Geri</div>
        <div style={{fontSize:'18px',fontWeight:'700',color:s.text}}>🎯 Hedef Takibi</div>
      </div>
      <div style={{padding:'28px'}}>
        {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'16px'}}>
          {ogrenciler.map((o,i)=>{
            const hList=hedefler[o.id]||[];
            const yh=yeniHedef[o.id]||{baslik:'',deger:''};
            return(
              <div key={o.id} style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',overflow:'hidden'}}>
                <div style={{padding:'14px 16px',borderBottom:`1px solid ${s.border}`,display:'flex',alignItems:'center',gap:'10px'}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'50%',background:renkler[i%renkler.length]+'33',display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'12px'}}>
                    {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div style={{color:s.text,fontSize:'13.5px',fontWeight:'600'}}>{o.isim}</div>
                </div>
                <div style={{padding:'14px 16px'}}>
                  <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                    <input value={yh.baslik} onChange={e=>setYeniHedef(prev=>({...prev,[o.id]:{...prev[o.id],baslik:e.target.value}}))} placeholder="Hedef (örn: TYT Net)" style={{flex:1,background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'8px',padding:'8px 10px',color:s.text,fontSize:'12px',outline:'none'}}/>
                    <input value={yh.deger} onChange={e=>setYeniHedef(prev=>({...prev,[o.id]:{...prev[o.id],deger:e.target.value}}))} placeholder="Değer" style={{width:'70px',background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'8px',padding:'8px 10px',color:s.text,fontSize:'12px',outline:'none'}}/>
                    <button onClick={()=>hedefEkle(o.id)} style={{padding:'8px 12px',background:s.accentSoft,border:`1px solid ${s.accent}`,color:'#A09DFF',borderRadius:'8px',cursor:'pointer',fontSize:'12px',fontWeight:'600'}}>+</button>
                  </div>
                  {hList.length===0?<div style={{color:s.text3,fontSize:'12px',textAlign:'center',padding:'8px'}}>Henüz hedef yok</div>:
                  hList.map(h=>(
                    <div key={h.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 10px',background:s.surface2,borderRadius:'8px',marginBottom:'6px'}}>
                      <span style={{fontSize:'14px'}}>🎯</span>
                      <div style={{flex:1,fontSize:'13px',color:s.text}}>{h.baslik}</div>
                      <div style={{fontSize:'14px',fontWeight:'700',color:'#A09DFF'}}>{h.deger}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>}
      </div>
    </div>
  );
}

// ===== VELİ RAPORLARI SAYFASI =====
function VeliRaporlariSayfasi({ogrenciler,onGeri}){
  const[veriler,setVeriler]=useState({});
  const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{
      const obj={};
      for(const o of ogrenciler){
        try{
          const ps=await getDocs(collection(db,'ogrenciler',o.id,'program'));
          const prog=ps.docs.map(d=>({id:d.id,...d.data()}));
          const ds=await getDocs(collection(db,'ogrenciler',o.id,'denemeler'));
          const den=ds.docs.map(d=>({id:d.id,...d.data()}));
          den.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));
          obj[o.id]={prog,den};
        }catch(e){}
      }
      setVeriler(obj);setYukleniyor(false);
    };
    getir();
  },[]);
  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif'}}>
      <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'16px 28px',display:'flex',alignItems:'center',gap:'14px'}}>
        <div onClick={onGeri} style={{background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'13px'}}>← Geri</div>
        <div style={{fontSize:'18px',fontWeight:'700',color:s.text}}>📋 Veli Raporları</div>
      </div>
      <div style={{padding:'28px'}}>
        {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          {ogrenciler.map((o,i)=>{
            const d=veriler[o.id]||{prog:[],den:[]};
            const tam=d.prog.filter(p=>p.tamamlandi).length;
            const oran=d.prog.length>0?Math.round((tam/d.prog.length)*100):0;
            const sonDeneme=d.den[0];
            return(
              <div key={o.id} style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',padding:'20px',display:'flex',alignItems:'center',gap:'20px'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'50%',background:renkler[i%renkler.length]+'33',display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'16px',flexShrink:0}}>
                  {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div style={{flex:1}}>
                  <div style={{color:s.text,fontSize:'15px',fontWeight:'600'}}>{o.isim}</div>
                  <div style={{color:s.text2,fontSize:'12px',marginTop:'2px'}}>{o.tur} · {o.email}</div>
                  {o.veliEmail&&<div style={{color:s.text3,fontSize:'11px',marginTop:'2px'}}>Veli: {o.veliEmail}</div>}
                </div>
                <div style={{display:'flex',gap:'16px'}}>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'22px',fontWeight:'700',color:oran>=80?'#34C98A':oran>=50?'#FFA040':'#FF6B6B'}}>{oran}%</div>
                    <div style={{fontSize:'10px',color:s.text3}}>Program</div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'22px',fontWeight:'700',color:'#A09DFF'}}>{sonDeneme?sonDeneme.toplamNet:'—'}</div>
                    <div style={{fontSize:'10px',color:s.text3}}>Son Net</div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:'22px',fontWeight:'700',color:'#FFA040'}}>{d.den.length}</div>
                    <div style={{fontSize:'10px',color:s.text3}}>Deneme</div>
                  </div>
                </div>
                {!o.veliEmail&&<div style={{background:'rgba(255,107,107,0.1)',border:'1px solid rgba(255,107,107,0.2)',color:'#FF6B6B',padding:'6px 12px',borderRadius:'8px',fontSize:'11px',fontWeight:'600'}}>Veli yok</div>}
              </div>
            );
          })}
        </div>}
      </div>
    </div>
  );
}

// ===== ÇALIŞMA KARTİ =====
function CalismaKarti({ogrenciId,beklenenSaat,gorevOrani,onKaydet}){
  const bugun=new Date().toISOString().split('T')[0];
  const[saat,setSaat]=useState('');
  const[kaydedildi,setKaydedildi]=useState(false);
  const[yukleniyor,setYukleniyor]=useState(false);
  const[mevcutSaat,setMevcutSaat]=useState(null);
  useEffect(()=>{
    const getir=async()=>{
      try{const snap=await getDoc(doc(db,'ogrenciler',ogrenciId,'calisma',bugun));
      if(snap.exists()){setMevcutSaat(snap.data().saat);setSaat(String(snap.data().saat));setKaydedildi(true);}}catch(e){}
    };
    getir();
  },[]);
  const kaydet=async()=>{
    const ss=parseFloat(saat);if(!ss||ss<=0)return;
    setYukleniyor(true);
    try{const ver=verimlilikHesapla(ss,beklenenSaat,gorevOrani);
    await setDoc(doc(db,'ogrenciler',ogrenciId,'calisma',bugun),{saat:ss,tarih:bugun,verimlilik:ver,gorevOrani,beklenenSaat,olusturma:new Date()});
    setMevcutSaat(ss);setKaydedildi(true);if(onKaydet)onKaydet();}catch(e){alert(e.message);}
    setYukleniyor(false);
  };
  const ver=mevcutSaat!==null?verimlilikHesapla(mevcutSaat,beklenenSaat,gorevOrani):null;
  const durum=ver!==null?verimlilikDurum(ver):null;
  return(
    <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',padding:'20px'}}>
      <div style={{fontWeight:'600',fontSize:'14px',color:s.text,marginBottom:'16px'}}>⏱️ Bugün Kaç Saat Çalıştım?</div>
      <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'16px'}}>
        <input type="number" min="0" max="16" step="0.5" value={saat} onChange={e=>setSaat(e.target.value)} placeholder="0" style={{width:'80px',background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'10px 14px',color:s.text,fontSize:'18px',fontWeight:'700',outline:'none',textAlign:'center'}}/>
        <div style={{fontSize:'14px',color:s.text2}}>saat</div>
        <div style={{flex:1}}/>
        <div style={{fontSize:'12px',color:s.text3}}>Beklenen: <span style={{color:s.text2,fontWeight:'600'}}>{beklenenSaat}s</span></div>
        <button onClick={kaydet} disabled={!saat||yukleniyor} style={{padding:'10px 18px',background:saat?s.accentSoft:'#2A2B3D',border:saat?`2px solid ${s.accent}`:`1px solid ${s.border}`,color:saat?'#A09DFF':s.text3,borderRadius:'10px',cursor:saat?'pointer':'not-allowed',fontSize:'13px',fontWeight:'700'}}>
          {yukleniyor?'...':kaydedildi?'Güncelle':'Kaydet'}
        </button>
      </div>
      {durum&&(
        <div style={{background:s.surface2,borderRadius:'12px',padding:'14px 16px',display:'flex',alignItems:'center',gap:'14px'}}>
          <div style={{fontSize:'28px'}}>{durum.emoji}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:'14px',fontWeight:'700',color:durum.renk}}>{durum.label}</div>
            <div style={{fontSize:'12px',color:s.text3,marginTop:'2px'}}>{mevcutSaat}s çalışıldı · %{gorevOrani} görev</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:'28px',fontWeight:'700',color:durum.renk}}>{ver}%</div>
            <div style={{fontSize:'11px',color:s.text3}}>verimlilik</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== DENEME GİRİŞ MODAL =====
function DenemeModal({ogrenciId,onKapat,onEkle}){
  const[sinav,setSinav]=useState('TYT');
  const[tarih,setTarih]=useState(new Date().toISOString().split('T')[0]);
  const[veriler,setVeriler]=useState({});
  const[yukleniyor,setYukleniyor]=useState(false);
  const dersler=sinav==='TYT'?TYT_DERSLER:AYT_DERSLER;
  const guncelle=(dersId,tip,deger)=>setVeriler(prev=>({...prev,[dersId]:{...prev[dersId],[tip]:parseInt(deger)||0}}));
  const kaydet=async()=>{
    setYukleniyor(true);
    try{const netler={};let toplamNet=0;
    dersler.forEach(d=>{const dy=veriler[d.id]||{};const net=parseFloat(netHesapla(dy.d||0,dy.y||0));netler[d.id]={d:dy.d||0,y:dy.y||0,b:dy.b||0,net};toplamNet+=net;});
    await addDoc(collection(db,'ogrenciler',ogrenciId,'denemeler'),{sinav,tarih,netler,toplamNet:toplamNet.toFixed(2),olusturma:new Date()});
    onEkle();onKapat();}catch(e){alert(e.message);}
    setYukleniyor(false);
  };
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,overflowY:'auto'}}>
      <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'20px',padding:'32px',width:'560px',margin:'20px',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{color:s.text,fontSize:'18px',fontWeight:'700',marginBottom:'20px'}}>Deneme Sonucu Gir</div>
        <div style={{display:'flex',gap:'10px',marginBottom:'16px'}}>
          {['TYT','AYT'].map(t=>(<div key={t} onClick={()=>{setSinav(t);setVeriler({});}} style={{flex:1,padding:'10px',borderRadius:'10px',border:sinav===t?`2px solid ${s.accent}`:`1px solid ${s.border}`,background:sinav===t?s.accentSoft:s.surface2,color:sinav===t?'#A09DFF':s.text2,cursor:'pointer',textAlign:'center',fontSize:'14px',fontWeight:'600'}}>{t}</div>))}
          <input type="date" value={tarih} onChange={e=>setTarih(e.target.value)} style={{flex:1,background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'10px 12px',color:s.text,fontSize:'13px',outline:'none'}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'8px',marginBottom:'20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px 80px',gap:'8px',padding:'8px 10px',background:s.surface2,borderRadius:'8px'}}>
            <div style={{fontSize:'11px',color:s.text3,fontWeight:'600'}}>DERS</div>
            <div style={{fontSize:'11px',color:'#34C98A',fontWeight:'600',textAlign:'center'}}>DOĞRU</div>
            <div style={{fontSize:'11px',color:'#FF6B6B',fontWeight:'600',textAlign:'center'}}>YANLIŞ</div>
            <div style={{fontSize:'11px',color:s.text3,fontWeight:'600',textAlign:'center'}}>BOŞ</div>
            <div style={{fontSize:'11px',color:'#A09DFF',fontWeight:'600',textAlign:'center'}}>NET</div>
          </div>
          {dersler.map(ders=>{const dy=veriler[ders.id]||{};const net=netHesapla(dy.d||0,dy.y||0);return(
            <div key={ders.id} style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px 80px',gap:'8px',padding:'8px 10px',background:s.surface2,borderRadius:'8px',alignItems:'center'}}>
              <div style={{fontSize:'13px',color:ders.renk,fontWeight:'500'}}>{ders.label}</div>
              <input type="number" min="0" max={ders.toplam} placeholder="0" value={dy.d||''} onChange={e=>guncelle(ders.id,'d',e.target.value)} style={{background:'#0C0E14',border:`1px solid #34C98A`,borderRadius:'6px',padding:'6px 8px',color:'#34C98A',fontSize:'13px',outline:'none',textAlign:'center',width:'100%',boxSizing:'border-box'}}/>
              <input type="number" min="0" max={ders.toplam} placeholder="0" value={dy.y||''} onChange={e=>guncelle(ders.id,'y',e.target.value)} style={{background:'#0C0E14',border:`1px solid #FF6B6B`,borderRadius:'6px',padding:'6px 8px',color:'#FF6B6B',fontSize:'13px',outline:'none',textAlign:'center',width:'100%',boxSizing:'border-box'}}/>
              <input type="number" min="0" max={ders.toplam} placeholder="0" value={dy.b||''} onChange={e=>guncelle(ders.id,'b',e.target.value)} style={{background:'#0C0E14',border:`1px solid ${s.border}`,borderRadius:'6px',padding:'6px 8px',color:s.text2,fontSize:'13px',outline:'none',textAlign:'center',width:'100%',boxSizing:'border-box'}}/>
              <div style={{fontSize:'15px',fontWeight:'700',color:'#A09DFF',textAlign:'center'}}>{net}</div>
            </div>
          );})}
          <div style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px 80px',gap:'8px',padding:'10px',background:'rgba(124,110,250,0.08)',borderRadius:'8px',border:`1px solid ${s.accent}`,alignItems:'center'}}>
            <div style={{fontSize:'13px',fontWeight:'700',color:s.text}}>TOPLAM NET</div>
            <div/><div/><div/>
            <div style={{fontSize:'18px',fontWeight:'700',color:'#A09DFF',textAlign:'center'}}>
              {dersler.reduce((acc,ders)=>{const dy=veriler[ders.id]||{};return acc+parseFloat(netHesapla(dy.d||0,dy.y||0));},0).toFixed(2)}
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:'10px'}}>
          <button onClick={onKapat} style={{flex:1,padding:'12px',background:'transparent',border:`1px solid ${s.border}`,color:s.text2,borderRadius:'10px',cursor:'pointer',fontSize:'14px',fontWeight:'600'}}>İptal</button>
          <button onClick={kaydet} disabled={yukleniyor} style={{flex:2,padding:'12px',background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',borderRadius:'10px',cursor:'pointer',fontSize:'14px',fontWeight:'700'}}>{yukleniyor?'Kaydediliyor...':'Kaydet →'}</button>
        </div>
      </div>
    </div>
  );
}

// ===== DENEME LİSTESİ =====
function DenemeListesi({ogrenciId}){
  const[denemeler,setDenemeler]=useState([]);
  const[modalAcik,setModalAcik]=useState(false);
  const[secili,setSecili]=useState(null);
  const[yukleniyor,setYukleniyor]=useState(true);
  const getir=async()=>{
    try{const snap=await getDocs(collection(db,'ogrenciler',ogrenciId,'denemeler'));
    const liste=snap.docs.map(d=>({id:d.id,...d.data()}));liste.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));setDenemeler(liste);}catch(e){console.log(e);}
    setYukleniyor(false);
  };
  useEffect(()=>{getir();},[]);
  return(
    <div>
      {modalAcik&&<DenemeModal ogrenciId={ogrenciId} onKapat={()=>setModalAcik(false)} onEkle={getir}/>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
        <div style={{fontWeight:'600',fontSize:'14px',color:s.text}}>📊 Deneme Sonuçları</div>
        <button onClick={()=>setModalAcik(true)} style={{padding:'8px 16px',background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'600'}}>+ Deneme Ekle</button>
      </div>
      {yukleniyor?<div style={{textAlign:'center',padding:'20px',color:s.text3}}>Yükleniyor...</div>:
      denemeler.length===0?<div style={{textAlign:'center',padding:'30px',background:s.surface2,borderRadius:'12px'}}><div style={{fontSize:'28px',marginBottom:'8px'}}>📊</div><div style={{color:s.text2,fontSize:'13px'}}>Henüz deneme yok</div></div>:
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        {denemeler.map(d=>(
          <div key={d.id} style={{background:s.surface2,borderRadius:'12px',overflow:'hidden',border:`1px solid ${s.border}`}}>
            <div onClick={()=>setSecili(secili===d.id?null:d.id)} style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 16px',cursor:'pointer'}}>
              <div style={{background:s.accentSoft,color:'#A09DFF',padding:'4px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'700'}}>{d.sinav}</div>
              <div style={{fontSize:'13px',color:s.text2}}>{d.tarih}</div>
              <div style={{marginLeft:'auto',fontSize:'20px',fontWeight:'700',color:'#A09DFF'}}>{d.toplamNet}</div>
              <div style={{fontSize:'12px',color:s.text3}}>net</div>
              <div style={{color:s.text3,fontSize:'12px'}}>{secili===d.id?'▲':'▼'}</div>
            </div>
            {secili===d.id&&(
              <div style={{padding:'12px 16px',borderTop:`1px solid ${s.border}`}}>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'8px'}}>
                  {Object.entries(d.netler||{}).map(([dersId,v])=>{
                    const dl=[...TYT_DERSLER,...AYT_DERSLER].find(x=>x.id===dersId);
                    return(<div key={dersId} style={{background:s.surface,borderRadius:'8px',padding:'10px 12px'}}>
                      <div style={{fontSize:'11px',color:s.text3,marginBottom:'4px'}}>{dl?.label||dersId}</div>
                      <div style={{fontSize:'16px',fontWeight:'700',color:dl?.renk||'#A09DFF'}}>{v.net}</div>
                      <div style={{fontSize:'10.5px',color:s.text3,marginTop:'2px'}}>{v.d}D · {v.y}Y · {v.b}B</div>
                    </div>);
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>}
    </div>
  );
}

// ===== HAFTALIK VERİMLİLİK =====
function HaftalikVerimlilik({ogrenciId}){
  const[veriler,setVeriler]=useState([]);
  const gunler=['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];
  useEffect(()=>{
    const getir=async()=>{try{const snap=await getDocs(collection(db,'ogrenciler',ogrenciId,'calisma'));setVeriler(snap.docs.map(d=>({tarih:d.id,...d.data()})));}catch(e){}};
    getir();
  },[]);
  const bugun=new Date();
  const haftaGunleri=Array.from({length:7},(_,i)=>{const d=new Date(bugun);d.setDate(bugun.getDate()-bugun.getDay()+i+1);return d.toISOString().split('T')[0];});
  return(
    <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',padding:'20px'}}>
      <div style={{fontWeight:'600',fontSize:'14px',color:s.text,marginBottom:'16px'}}>📈 Bu Hafta Verimlilik</div>
      <div style={{display:'flex',gap:'8px'}}>
        {haftaGunleri.map((tarih,i)=>{const veri=veriler.find(v=>v.tarih===tarih);const durum=veri?verimlilikDurum(veri.verimlilik):null;return(
          <div key={tarih} style={{flex:1,textAlign:'center'}}>
            <div style={{fontSize:'10px',color:s.text3,marginBottom:'6px'}}>{gunler[i].slice(0,3)}</div>
            <div style={{height:'60px',borderRadius:'8px',background:durum?durum.renk+'33':s.surface2,border:`1px solid ${durum?durum.renk:s.border}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'2px'}}>
              {durum?<><div style={{fontSize:'16px'}}>{durum.emoji}</div><div style={{fontSize:'10px',fontWeight:'700',color:durum.renk}}>{veri.verimlilik}%</div></>:
              <div style={{fontSize:'11px',color:s.text3}}>—</div>}
            </div>
            {veri&&<div style={{fontSize:'10px',color:s.text3,marginTop:'4px'}}>{veri.saat}s</div>}
          </div>
        );})}
      </div>
    </div>
  );
}

// ===== KOÇ NOTLARI =====
function KocNotlari({ogrenciId}){
  const[notlar,setNotlar]=useState([]);
  const[yeniNot,setYeniNot]=useState('');
  const[yukleniyor,setYukleniyor]=useState(false);
  const getir=async()=>{
    try{const snap=await getDocs(collection(db,'ogrenciler',ogrenciId,'notlar'));
    const liste=snap.docs.map(d=>({id:d.id,...d.data()}));
    liste.sort((a,b)=>(b.olusturma?.seconds||0)-(a.olusturma?.seconds||0));setNotlar(liste);}catch(e){}
  };
  useEffect(()=>{getir();},[]);
  const kaydet=async()=>{
    if(!yeniNot.trim())return;setYukleniyor(true);
    try{await addDoc(collection(db,'ogrenciler',ogrenciId,'notlar'),{not:yeniNot,olusturma:new Date()});setYeniNot('');await getir();}catch(e){alert(e.message);}
    setYukleniyor(false);
  };
  return(
    <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',padding:'20px'}}>
      <div style={{fontWeight:'600',fontSize:'14px',marginBottom:'12px',color:s.text}}>📝 Koç Notları</div>
      <textarea value={yeniNot} onChange={e=>setYeniNot(e.target.value)} placeholder="Yeni not ekle..." style={{width:'100%',background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'12px 14px',color:s.text,fontSize:'13px',outline:'none',resize:'vertical',minHeight:'80px',boxSizing:'border-box',fontFamily:'sans-serif'}}/>
      <button onClick={kaydet} disabled={!yeniNot.trim()||yukleniyor} style={{marginTop:'10px',padding:'10px 20px',background:yeniNot.trim()?s.accentSoft:'#2A2B3D',border:yeniNot.trim()?`2px solid ${s.accent}`:`1px solid ${s.border}`,color:yeniNot.trim()?'#A09DFF':s.text3,borderRadius:'8px',cursor:yeniNot.trim()?'pointer':'not-allowed',fontSize:'13px',fontWeight:'600'}}>
        {yukleniyor?'Kaydediliyor...':'Not Ekle'}
      </button>
      {notlar.length>0&&(
        <div style={{marginTop:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
          {notlar.map(n=>(
            <div key={n.id} style={{background:s.surface2,borderRadius:'10px',padding:'12px 14px'}}>
              <div style={{fontSize:'11px',color:s.text3,marginBottom:'6px'}}>{n.olusturma?.toDate?n.olusturma.toDate().toLocaleDateString('tr-TR'):''}</div>
              <div style={{fontSize:'13px',color:s.text,lineHeight:'1.5'}}>{n.not}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== OGRENCİ EKLE MODAL =====
function OgrenciEkleModal({onKapat,onEkle}){
  const[isim,setIsim]=useState('');const[email,setEmail]=useState('');const[sifre,setSifre]=useState('');
  const[veliEmail,setVeliEmail]=useState('');const[veliSifre,setVeliSifre]=useState('');
  const[tur,setTur]=useState('TYT');const[beklenenSaat,setBeklenenSaat]=useState(6);
  const[yukleniyor,setYukleniyor]=useState(false);const[hata,setHata]=useState('');
  const ekle=async()=>{
    if(!isim||!email||!sifre)return;if(sifre.length<6){setHata('Şifre en az 6 karakter!');return;}
    setYukleniyor(true);setHata('');
    try{
      const oSnuc=await createUserWithEmailAndPassword(auth,email,sifre);
      const oUid=oSnuc.user.uid;let vUid=null;
      if(veliEmail&&veliSifre&&veliSifre.length>=6){
        try{const vSnuc=await createUserWithEmailAndPassword(auth,veliEmail,veliSifre);vUid=vSnuc.user.uid;
        await setDoc(doc(db,'kullanicilar',vUid),{email:veliEmail,rol:'veli',ogrenciUid:oUid,ogrenciIsim:isim,olusturma:new Date()});}
        catch(e){if(e.code!=='auth/email-already-in-use')throw e;}
      }
      await setDoc(doc(db,'kullanicilar',oUid),{isim,email,tur,rol:'ogrenci',tamamlama:0,beklenenSaat,veliEmail:veliEmail||'',veliUid:vUid||'',olusturma:new Date()});
      await setDoc(doc(db,'ogrenciler',oUid),{isim,email,tur,tamamlama:0,beklenenSaat,veliEmail:veliEmail||'',olusturma:new Date()});
      onEkle();onKapat();
    }catch(e){if(e.code==='auth/email-already-in-use')setHata('Bu email zaten kullanımda!');else setHata('Hata: '+e.message);}
    setYukleniyor(false);
  };
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,overflowY:'auto'}}>
      <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'20px',padding:'36px',width:'440px',margin:'20px'}}>
        <div style={{color:s.text,fontSize:'18px',fontWeight:'700',marginBottom:'20px'}}>Yeni Öğrenci Ekle</div>
        <div style={{color:s.accent,fontSize:'11px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px'}}>Öğrenci Bilgileri</div>
        {[{l:'Ad Soyad',v:isim,fn:setIsim,p:'Ad Soyad',t:'text'},{l:'Email',v:email,fn:setEmail,p:'email@ornek.com',t:'email'},{l:'Şifre',v:sifre,fn:setSifre,p:'En az 6 karakter',t:'password'}].map(f=>(
          <div key={f.l} style={{marginBottom:'10px'}}>
            <div style={{color:s.text2,fontSize:'12px',marginBottom:'5px'}}>{f.l}</div>
            <input type={f.t} value={f.v} onChange={e=>f.fn(e.target.value)} placeholder={f.p} style={{width:'100%',background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'10px 14px',color:s.text,fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
          </div>
        ))}
        <div style={{marginBottom:'10px'}}>
          <div style={{color:s.text2,fontSize:'12px',marginBottom:'5px'}}>Günlük Beklenen Çalışma</div>
          <div style={{display:'flex',gap:'6px'}}>
            {[4,5,6,7,8].map(n=>(
              <div key={n} onClick={()=>setBeklenenSaat(n)} style={{flex:1,padding:'8px',borderRadius:'8px',border:beklenenSaat===n?`2px solid ${s.accent}`:`1px solid ${s.border}`,background:beklenenSaat===n?s.accentSoft:s.surface2,color:beklenenSaat===n?'#A09DFF':s.text2,cursor:'pointer',textAlign:'center',fontSize:'13px',fontWeight:'600'}}>{n}s</div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:'14px'}}>
          <div style={{color:s.text2,fontSize:'12px',marginBottom:'5px'}}>Sınav Türü</div>
          <div style={{display:'flex',gap:'8px'}}>
            {['TYT','TYT+AYT','LGS'].map(t=>(<div key={t} onClick={()=>setTur(t)} style={{flex:1,padding:'9px',borderRadius:'10px',border:tur===t?`2px solid ${s.accent}`:`1px solid ${s.border}`,background:tur===t?s.accentSoft:s.surface2,color:tur===t?'#A09DFF':s.text2,cursor:'pointer',textAlign:'center',fontSize:'13px',fontWeight:'500'}}>{t}</div>))}
          </div>
        </div>
        <div style={{borderTop:`1px solid ${s.border}`,paddingTop:'14px',marginBottom:'14px'}}>
          <div style={{color:'#34C98A',fontSize:'11px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px'}}>Veli (İsteğe Bağlı)</div>
          {[{l:'Veli Email',v:veliEmail,fn:setVeliEmail,p:'veli@email.com',t:'email'},{l:'Veli Şifre',v:veliSifre,fn:setVeliSifre,p:'En az 6 karakter',t:'password'}].map(f=>(
            <div key={f.l} style={{marginBottom:'10px'}}>
              <div style={{color:s.text2,fontSize:'12px',marginBottom:'5px'}}>{f.l}</div>
              <input type={f.t} value={f.v} onChange={e=>f.fn(e.target.value)} placeholder={f.p} style={{width:'100%',background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'10px 14px',color:s.text,fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
            </div>
          ))}
        </div>
        {hata&&<div style={{color:'#FF6B6B',fontSize:'13px',marginBottom:'12px'}}>{hata}</div>}
        <div style={{display:'flex',gap:'10px'}}>
          <button onClick={onKapat} style={{flex:1,padding:'12px',background:'transparent',border:`1px solid ${s.border}`,color:s.text2,borderRadius:'10px',cursor:'pointer',fontSize:'14px',fontWeight:'600'}}>İptal</button>
          <button onClick={ekle} disabled={!isim||!email||!sifre||yukleniyor} style={{flex:2,padding:'12px',background:isim&&email&&sifre?s.accentSoft:'#2A2B3D',border:isim&&email&&sifre?`2px solid ${s.accent}`:`1px solid ${s.border}`,color:isim&&email&&sifre?'#A09DFF':s.text3,borderRadius:'10px',cursor:isim&&email&&sifre?'pointer':'not-allowed',fontSize:'14px',fontWeight:'700'}}>
            {yukleniyor?'Ekleniyor...':'Ekle →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== VELİ PANELİ =====
function VeliPaneli({kullanici,veliData,onCikis}){
  const[ogrenciData,setOgrenciData]=useState(null);
  const[program,setProgram]=useState([]);
  const[denemeler,setDenemeler]=useState([]);
  const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{
      try{if(veliData?.ogrenciUid){
        const os=await getDoc(doc(db,'kullanicilar',veliData.ogrenciUid));
        if(os.exists())setOgrenciData(os.data());
        const ps=await getDocs(collection(db,'ogrenciler',veliData.ogrenciUid,'program'));
        setProgram(ps.docs.map(d=>({id:d.id,...d.data()})));
        const ds=await getDocs(collection(db,'ogrenciler',veliData.ogrenciUid,'denemeler'));
        const dl=ds.docs.map(d=>({id:d.id,...d.data()}));dl.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));setDenemeler(dl);
      }}catch(e){}setYukleniyor(false);
    };
    getir();
  },[]);
  const tam=program.filter(p=>p.tamamlandi).length;
  const oran=program.length>0?Math.round((tam/program.length)*100):0;
  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif'}}>
      <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'16px 28px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{fontSize:'20px',fontWeight:'bold',color:s.text}}>Koç<span style={{color:s.accent}}>Panel</span></div>
          <div style={{background:'rgba(46,204,143,0.15)',color:'#34C98A',padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'600'}}>Veli</div>
        </div>
        <button onClick={onCikis} style={{background:'rgba(255,107,107,0.08)',border:'1px solid rgba(255,107,107,0.2)',color:'#FF6B6B',padding:'7px 14px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'600'}}>Çıkış</button>
      </div>
      <div style={{padding:'28px',maxWidth:'900px',margin:'0 auto'}}>
        {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:!ogrenciData?<div style={{textAlign:'center',padding:'60px',color:s.text2}}>Bilgi bulunamadı.</div>:(
          <>
            <div style={{background:'linear-gradient(135deg,#1a4a3a,#1a2a4a)',border:`1px solid ${s.border}`,borderRadius:'16px',padding:'24px 28px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'20px'}}>
              <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'rgba(52,201,138,0.2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#34C98A',fontWeight:'700',fontSize:'20px'}}>
                {ogrenciData.isim?.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:'20px',fontWeight:'bold',color:s.text}}>{ogrenciData.isim}</div>
                <div style={{fontSize:'13px',color:s.text2,marginTop:'3px'}}>{ogrenciData.tur} · {ogrenciData.email}</div>
              </div>
              <div style={{display:'flex',gap:'20px'}}>
                <div style={{textAlign:'center'}}><div style={{fontSize:'32px',fontWeight:'bold',color:'#34C98A'}}>{oran}%</div><div style={{fontSize:'11px',color:s.text2}}>Görev</div></div>
                {denemeler[0]&&<div style={{textAlign:'center'}}><div style={{fontSize:'32px',fontWeight:'bold',color:'#A09DFF'}}>{denemeler[0].toplamNet}</div><div style={{fontSize:'11px',color:s.text2}}>Son Net</div></div>}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'24px'}}>
              {[{l:'Toplam Görev',v:program.length,c:'#A09DFF'},{l:'Tamamlanan',v:tam,c:'#34C98A'},{l:'Deneme Sayısı',v:denemeler.length,c:'#FFA040'}].map(k=>(
                <div key={k.l} style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'14px',padding:'16px'}}>
                  <div style={{fontSize:'11px',color:s.text2,textTransform:'uppercase',marginBottom:'8px'}}>{k.l}</div>
                  <div style={{fontSize:'28px',fontWeight:'bold',color:k.c}}>{k.v}</div>
                </div>
              ))}
            </div>
            <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',overflow:'hidden'}}>
              <div style={{padding:'16px 20px',borderBottom:`1px solid ${s.border}`}}><div style={{color:s.text,fontWeight:'600',fontSize:'14px'}}>📅 Haftalık Program</div></div>
              <div style={{padding:'16px 20px'}}>
                {program.length===0?<div style={{textAlign:'center',padding:'20px',color:s.text3}}>Program henüz eklenmemiş</div>:
                program.map(p=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom:`1px solid ${s.border}`}}>
                    <div style={{width:'20px',height:'20px',borderRadius:'6px',background:p.tamamlandi?'#34C98A':s.surface2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',color:'white'}}>{p.tamamlandi&&'✓'}</div>
                    <div style={{flex:1}}><div style={{fontSize:'13px',color:p.tamamlandi?s.text3:s.text,textDecoration:p.tamamlandi?'line-through':'none'}}>{p.gorev}</div><div style={{fontSize:'11px',color:s.text3}}>{p.ders}</div></div>
                    <div style={{fontSize:'11px',fontWeight:'600',color:p.tamamlandi?'#34C98A':'#FFA040'}}>{p.tamamlandi?'✓ Tamamlandı':'Bekliyor'}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===== OGRENCİ PANELİ =====
// KOÇ NOTLARINI GÖRÜNTÜLE
function KocNotlariOgrenci({ogrenciId}){
  const[notlar,setNotlar]=useState([]);
  useEffect(()=>{
    const getir=async()=>{
      try{const snap=await getDocs(collection(db,'ogrenciler',ogrenciId,'notlar'));
      const liste=snap.docs.map(d=>({id:d.id,...d.data()}));
      liste.sort((a,b)=>(b.olusturma?.seconds||0)-(a.olusturma?.seconds||0));
      setNotlar(liste);}catch(e){}
    };getir();
  },[]);
  return(
    <div style={{background:'#14151F',border:'1px solid #2A2B3D',borderRadius:'16px',padding:'20px'}}>
      <div style={{fontWeight:'600',fontSize:'14px',marginBottom:'12px',color:'#ffffff'}}>Kocumdan Notlar</div>
      {notlar.length===0?<div style={{textAlign:'center',padding:'20px',color:'#4E5070',fontSize:'13px'}}>Henuz not yok</div>:
      notlar.map(n=>(
        <div key={n.id} style={{background:'#1C1D2C',borderRadius:'10px',padding:'12px 14px',marginBottom:'8px',borderLeft:'3px solid #7C6EFA'}}>
          <div style={{fontSize:'11px',color:'#4E5070',marginBottom:'6px'}}>{n.olusturma?.toDate?n.olusturma.toDate().toLocaleDateString('tr-TR'):''}</div>
          <div style={{fontSize:'13px',color:'#ffffff',lineHeight:'1.5'}}>{n.not}</div>
        </div>
      ))}
    </div>
  );
}
function OgrenciPaneli({kullanici,ogrenciData,onCikis}){
  const[program,setProgram]=useState([]);
  const[denemeler,setDenemeler]=useState([]);
  const[yukleniyor,setYukleniyor]=useState(true);
  const[denemeModal,setDenemeModal]=useState(false);
  const[aktifSekme,setAktifSekme]=useState('program');
  const getir=async()=>{
    try{
      const ps=await getDocs(collection(db,'ogrenciler',kullanici.uid,'program'));setProgram(ps.docs.map(d=>({id:d.id,...d.data()})));
      const ds=await getDocs(collection(db,'ogrenciler',kullanici.uid,'denemeler'));const dl=ds.docs.map(d=>({id:d.id,...d.data()}));dl.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));setDenemeler(dl);
    }catch(e){}setYukleniyor(false);
  };
  useEffect(()=>{getir();},[]);
  const gorevTamamla=async(id,mevcut)=>{try{await updateDoc(doc(db,'ogrenciler',kullanici.uid,'program',id),{tamamlandi:!mevcut});await getir();}catch(e){}};
  const tam=program.filter(p=>p.tamamlandi).length;
  const oran=program.length>0?Math.round((tam/program.length)*100):0;
  const beklenenSaat=ogrenciData?.beklenenSaat||6;
  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif'}}>
      {denemeModal&&<DenemeModal ogrenciId={kullanici.uid} onKapat={()=>setDenemeModal(false)} onEkle={getir}/>}
      <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'16px 28px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{fontSize:'20px',fontWeight:'bold',color:s.text}}>Koç<span style={{color:s.accent}}>Panel</span></div>
          <div style={{background:s.accentSoft,color:'#A09DFF',padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'600'}}>Öğrenci</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{display:'flex',gap:'6px'}}>
            {['program','denemeler','calisma','mesajlar','notlar'].map(sek=>(
              <div key={sek} onClick={()=>setAktifSekme(sek)} style={{padding:'6px 14px',borderRadius:'8px',background:aktifSekme===sek?s.accentSoft:'transparent',border:aktifSekme===sek?`1px solid ${s.accent}`:`1px solid ${s.border}`,color:aktifSekme===sek?'#A09DFF':s.text2,cursor:'pointer',fontSize:'12px',fontWeight:'500'}}>
                {sek==='program'?'📅 Program':sek==='denemeler'?'📊 Denemeler':sek==='calisma'?'⏱️ Çalışma':sek==='mesajlar'?'💬 Mesajlar':'📝 Notlar'}
              </div>
            ))}
          </div>
          <div style={{fontSize:'13px',color:s.text2}}>{ogrenciData?.isim||kullanici.email}</div>
          <button onClick={onCikis} style={{background:'rgba(255,107,107,0.08)',border:'1px solid rgba(255,107,107,0.2)',color:'#FF6B6B',padding:'7px 14px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'600'}}>Çıkış</button>
        </div>
      </div>
      <div style={{padding:'24px',maxWidth:'1000px',margin:'0 auto'}}>
        <div style={{background:`linear-gradient(135deg,${s.accent},#9B6CFF)`,borderRadius:'16px',padding:'20px 24px',marginBottom:'20px',display:'flex',alignItems:'center',gap:'20px'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:'20px',fontWeight:'bold',color:'white'}}>Hoş geldin, {ogrenciData?.isim?.split(' ')[0]||'Öğrenci'} 👋</div>
            <div style={{fontSize:'13px',color:'rgba(255,255,255,0.8)',marginTop:'3px'}}>{ogrenciData?.tur}</div>
          </div>
          <div style={{display:'flex',gap:'12px'}}>
            <div style={{background:'rgba(255,255,255,0.15)',borderRadius:'10px',padding:'10px 16px',textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:'bold',color:'white'}}>{oran}%</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.75)'}}>Tamamlama</div>
            </div>
            <div style={{background:'rgba(255,255,255,0.15)',borderRadius:'10px',padding:'10px 16px',textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:'bold',color:'white'}}>{tam}/{program.length}</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.75)'}}>Görev</div>
            </div>
            {denemeler[0]&&<div style={{background:'rgba(255,255,255,0.15)',borderRadius:'10px',padding:'10px 16px',textAlign:'center'}}>
              <div style={{fontSize:'22px',fontWeight:'bold',color:'white'}}>{denemeler[0].toplamNet}</div>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.75)'}}>Son {denemeler[0].sinav}</div>
            </div>}
          </div>
        </div>
        {aktifSekme==='program'&&(
          <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:`1px solid ${s.border}`}}><div style={{fontWeight:'600',fontSize:'14px',color:s.text}}>📅 Günlük Programım</div></div>
            <div style={{padding:'16px 20px'}}>
              {yukleniyor?<div style={{textAlign:'center',padding:'20px',color:s.text3}}>Yükleniyor...</div>:
              program.length===0?<div style={{textAlign:'center',padding:'30px'}}><div style={{fontSize:'28px',marginBottom:'8px'}}>📋</div><div style={{color:s.text2,fontSize:'13px'}}>Koçun henüz program eklemedi</div></div>:
              program.map(p=>(
                <div key={p.id} onClick={()=>gorevTamamla(p.id,p.tamamlandi)} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px 0',borderBottom:`1px solid ${s.border}`,cursor:'pointer'}}>
                  <div style={{width:'22px',height:'22px',borderRadius:'6px',border:p.tamamlandi?'none':`2px solid ${s.border}`,background:p.tamamlandi?'#34C98A':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0,color:'white'}}>{p.tamamlandi&&'✓'}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13.5px',color:p.tamamlandi?s.text3:s.text,textDecoration:p.tamamlandi?'line-through':'none',fontWeight:'500'}}>{p.gorev}</div>
                    <div style={{fontSize:'11.5px',color:s.text3,marginTop:'2px'}}>{p.ders}</div>
                  </div>
                  <div style={{fontSize:'12px',color:p.tamamlandi?'#34C98A':s.text3,fontWeight:'600'}}>{p.tamamlandi?'✓':'→'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {aktifSekme==='denemeler'&&<DenemeListesi ogrenciId={kullanici.uid}/>}
        {aktifSekme==='calisma'&&<CalismaKarti ogrenciId={kullanici.uid} beklenenSaat={beklenenSaat} gorevOrani={oran} onKaydet={getir}/>}
        {aktifSekme==='mesajlar'&&<MesajEkrani ogrenciId={kullanici.uid} gonderen="ogrenci"/>}
        {aktifSekme==='notlar'&&<KocNotlariOgrenci ogrenciId={kullanici.uid}/>}
      </div>
    </div>
  );
}

// ===== OGRENCİ DETAY (KOÇ) =====
function OgrenciDetay({ogrenci,onGeri}){
  const[program,setProgram]=useState([]);
  const[yeniGorev,setYeniGorev]=useState('');
  const[yeniDers,setYeniDers]=useState('Matematik');
  const[yukleniyor,setYukleniyor]=useState(false);
  const[aktifSekme,setAktifSekme]=useState('program');
  const dersler=['Matematik','Türkçe','Fizik','Kimya','Biyoloji','Tarih','Coğrafya','Edebiyat'];
  const programiGetir=async()=>{try{const snap=await getDocs(collection(db,'ogrenciler',ogrenci.id,'program'));setProgram(snap.docs.map(d=>({id:d.id,...d.data()})));}catch(e){}};
  useEffect(()=>{programiGetir();},[]);
  const gorevEkle=async()=>{
    if(!yeniGorev)return;setYukleniyor(true);
    try{await addDoc(collection(db,'ogrenciler',ogrenci.id,'program'),{gorev:yeniGorev,ders:yeniDers,tamamlandi:false,tarih:new Date()});setYeniGorev('');await programiGetir();}catch(e){alert(e.message);}
    setYukleniyor(false);
  };
  const tam=program.filter(p=>p.tamamlandi).length;
  const oran=program.length>0?Math.round((tam/program.length)*100):0;
  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif',color:s.text}}>
      <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'16px 28px',display:'flex',alignItems:'center',gap:'14px'}}>
        <div onClick={onGeri} style={{background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'13px'}}>← Geri</div>
        <div style={{fontSize:'18px',fontWeight:'700'}}>{ogrenci.isim}</div>
        <div style={{background:s.accentSoft,color:'#A09DFF',padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:'600'}}>{ogrenci.tur}</div>
        <div style={{display:'flex',gap:'6px',marginLeft:'8px'}}>
          {['program','denemeler','verimlilik','mesajlar'].map(sek=>(
            <div key={sek} onClick={()=>setAktifSekme(sek)} style={{padding:'6px 14px',borderRadius:'8px',background:aktifSekme===sek?s.accentSoft:'transparent',border:aktifSekme===sek?`1px solid ${s.accent}`:`1px solid ${s.border}`,color:aktifSekme===sek?'#A09DFF':s.text2,cursor:'pointer',fontSize:'12px',fontWeight:'500'}}>
              {sek==='program'?'📅 Program':sek==='denemeler'?'📊 Denemeler':sek==='verimlilik'?'📈 Verimlilik':'💬 Mesajlar'}
            </div>
          ))}
        </div>
        <div style={{marginLeft:'auto',fontSize:'13px',color:s.text2}}>{ogrenci.email}</div>
      </div>
      <div style={{padding:'24px'}}>
        {aktifSekme==='program'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
            <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',overflow:'hidden'}}>
              <div style={{padding:'16px 20px',borderBottom:`1px solid ${s.border}`,display:'flex',justifyContent:'space-between'}}>
                <div style={{fontWeight:'600',fontSize:'14px'}}>📅 Haftalık Program</div>
                <div style={{fontSize:'12px',color:s.text2}}>{tam}/{program.length} · %{oran}</div>
              </div>
              <div style={{padding:'16px 20px'}}>
                <div style={{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}}>
                  <select value={yeniDers} onChange={e=>setYeniDers(e.target.value)} style={{background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'8px',padding:'8px 12px',color:s.text,fontSize:'13px',outline:'none'}}>
                    {dersler.map(d=><option key={d}>{d}</option>)}
                  </select>
                  <input value={yeniGorev} onChange={e=>setYeniGorev(e.target.value)} placeholder="Görev yaz..." style={{flex:1,background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'8px',padding:'8px 12px',color:s.text,fontSize:'13px',outline:'none',minWidth:'120px'}}/>
                  <button onClick={gorevEkle} disabled={!yeniGorev||yukleniyor} style={{padding:'8px 16px',background:yeniGorev?s.accentSoft:'#2A2B3D',border:yeniGorev?`2px solid ${s.accent}`:`1px solid ${s.border}`,color:yeniGorev?'#A09DFF':s.text3,borderRadius:'8px',cursor:yeniGorev?'pointer':'not-allowed',fontSize:'13px',fontWeight:'600'}}>+ Ekle</button>
                </div>
                {program.length===0?<div style={{textAlign:'center',padding:'20px',color:s.text3,fontSize:'13px'}}>Henüz görev eklenmedi</div>:
                program.map(p=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:`1px solid ${s.border}`}}>
                    <div style={{width:'20px',height:'20px',borderRadius:'6px',background:p.tamamlandi?'#34C98A':s.surface2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',color:'white',flexShrink:0}}>{p.tamamlandi&&'✓'}</div>
                    <div style={{flex:1}}><div style={{fontSize:'13px',color:p.tamamlandi?s.text3:s.text,textDecoration:p.tamamlandi?'line-through':'none'}}>{p.gorev}</div><div style={{fontSize:'11px',color:s.text3}}>{p.ders}</div></div>
                    <div style={{fontSize:'11px',color:p.tamamlandi?'#34C98A':s.text3}}>{p.tamamlandi?'✓':'Bekliyor'}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',padding:'20px'}}>
                <div style={{fontWeight:'600',fontSize:'14px',marginBottom:'12px'}}>👤 Bilgiler</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                  {[{l:'SINAV TÜRÜ',v:ogrenci.tur,c:'#A09DFF'},{l:'TAMAMLAMA',v:'%'+oran,c:'#34C98A'},{l:'BEKLENEN',v:(ogrenci.beklenenSaat||6)+'s',c:'#FFA040'}].map(k=>(
                    <div key={k.l} style={{background:s.surface2,borderRadius:'10px',padding:'12px 14px'}}>
                      <div style={{fontSize:'11px',color:s.text3,marginBottom:'4px'}}>{k.l}</div>
                      <div style={{fontSize:'15px',fontWeight:'700',color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>
                {ogrenci.veliEmail&&<div style={{background:s.surface2,borderRadius:'10px',padding:'12px 14px'}}><div style={{fontSize:'11px',color:s.text3,marginBottom:'4px'}}>VELİ</div><div style={{fontSize:'13px',color:s.text2}}>{ogrenci.veliEmail}</div></div>}
              <button onClick={async()=>{if(window.confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')){try{await deleteDoc(doc(db,'ogrenciler',ogrenci.id));onGeri();}catch(e){alert(e.message);}}}} style={{marginTop:'10px',width:'100%',padding:'10px',background:'rgba(255,107,107,0.08)',border:'1px solid rgba(255,107,107,0.2)',color:'#FF6B6B',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'600'}}>🗑️ Öğrenciyi Sil</button>
              </div>
              <KocNotlari ogrenciId={ogrenci.id}/>
            </div>
          </div>
        )}
        {aktifSekme==='denemeler'&&<div style={{maxWidth:'700px'}}><DenemeListesi ogrenciId={ogrenci.id}/></div>}
        {aktifSekme==='verimlilik'&&<div style={{maxWidth:'700px'}}><HaftalikVerimlilik ogrenciId={ogrenci.id}/></div>}
        {aktifSekme==='mesajlar'&&<div style={{maxWidth:'700px'}}><MesajEkrani ogrenciId={ogrenci.id} gonderen="koc"/></div>}
      </div>
    </div>
  );
}

// ===== KOÇ PANELİ =====
function KocPaneli({kullanici,onCikis}){
  const[ogrenciler,setOgrenciler]=useState([]);
  const[modalAcik,setModalAcik]=useState(false);
  const[seciliOgrenci,setSeciliOgrenci]=useState(null);
  const[aktifSayfa,setAktifSayfa]=useState('ana');
  const[yukleniyor,setYukleniyor]=useState(true);
  const[okunmamisMesaj,setOkunmamisMesaj]=useState(0);

  const ogrencileriGetir=async()=>{
    setYukleniyor(true);
    try{const snap=await getDocs(collection(db,'ogrenciler'));setOgrenciler(snap.docs.map(d=>({id:d.id,...d.data()})));}catch(e){}
    setYukleniyor(false);
  };

  const mesajSayisiGetir=async(ogrList)=>{
    let toplam=0;
    const bugun=new Date();bugun.setHours(0,0,0,0);
    for(const o of ogrList){
      try{const snap=await getDocs(collection(db,'ogrenciler',o.id,'mesajlar'));
      toplam+=snap.docs.filter(d=>{
        const m=d.data();
        if(m.gonderen!=='ogrenci')return false;
        const t=m.olusturma?.toDate?m.olusturma.toDate():new Date(0);
        return t>=bugun;
      }).length;}catch(e){}
    }
    setOkunmamisMesaj(toplam);
  };

  useEffect(()=>{
    ogrencileriGetir().then(()=>{});
  },[]);

  useEffect(()=>{
    if(ogrenciler.length>0)mesajSayisiGetir(ogrenciler);
  },[ogrenciler]);

  if(seciliOgrenci)return<OgrenciDetay ogrenci={seciliOgrenci} onGeri={()=>setSeciliOgrenci(null)}/>;
  if(aktifSayfa==='mesajlar')return<KocMesajlarSayfasi ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/>;
  if(aktifSayfa==='haftalikprogram')return<HaftalikProgramSayfasi ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/>;
  if(aktifSayfa==='gunluktakip')return<GunlukTakipSayfasi ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/>;
  if(aktifSayfa==='denemeyonetimi')return<DenemeYonetimiSayfasi ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/>;
  if(aktifSayfa==='istatistikler')return<IstatistiklerSayfasi ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/>;
  if(aktifSayfa==='hedeftakibi')return<HedefTakibiSayfasi ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/>;
  if(aktifSayfa==='veliraporlari')return<VeliRaporlariSayfasi ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/>;
  if(aktifSayfa==='ogrenciler')return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif'}}>
      <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'16px 28px',display:'flex',alignItems:'center',gap:'14px'}}>
        <div onClick={()=>setAktifSayfa('ana')} style={{background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'700',fontSize:'13px'}}>← Geri</div>
        <div style={{fontSize:'18px',fontWeight:'700',color:s.text}}>👥 Öğrencilerim</div>
        <button onClick={()=>setModalAcik(true)} style={{marginLeft:'auto',background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'600'}}>+ Öğrenci Ekle</button>
      </div>
      {modalAcik&&<OgrenciEkleModal onKapat={()=>setModalAcik(false)} onEkle={()=>{signOut(auth).then(()=>window.location.reload());}}/>}
      <div style={{padding:'28px'}}>
        {ogrenciler.map((o,i)=>(
          <div key={o.id} onClick={()=>setSeciliOgrenci(o)} style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 20px',borderBottom:`1px solid ${s.border}`,cursor:'pointer',background:s.surface,borderRadius:'12px',marginBottom:'8px'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'50%',background:renkler[i%renkler.length]+'33',display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'14px'}}>
              {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div style={{flex:1}}>
              <div style={{color:s.text,fontSize:'14px',fontWeight:'500'}}>{o.isim}</div>
              <div style={{color:s.text2,fontSize:'12px'}}>{o.tur} · {o.email}</div>
            </div>
            <div style={{color:s.accent,fontSize:'14px'}}>→</div>
          </div>
        ))}
      </div>
    </div>
  );

  const ortTamamlama=ogrenciler.length>0?Math.round(ogrenciler.reduce((acc,o)=>acc+(o.tamamlama||0),0)/ogrenciler.length):0;
  const menu=[
    {icon:'←',label:'Çıkış',cikis:true},
    {icon:'🏠',label:'Genel Bakış',sayfa:'ana'},
    {icon:'👥',label:'Öğrencilerim',sayfa:'ogrenciler'},
    {icon:'📅',label:'Haftalık Program',sayfa:'haftalikprogram'},
    {icon:'✅',label:'Günlük Takip',sayfa:'gunluktakip'},
    {icon:'📊',label:'Deneme Yönetimi',sayfa:'denemeyonetimi'},
    {icon:'📈',label:'İstatistikler',sayfa:'istatistikler'},
    {icon:'🎯',label:'Hedef Takibi',sayfa:'hedeftakibi'},
    {icon:'💬',label:'Mesajlar',sayfa:'mesajlar',badge:okunmamisMesaj},
    {icon:'📋',label:'Veli Raporları',sayfa:'veliraporlari'},
  ];

  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'sans-serif',display:'flex'}}>
      {modalAcik&&<OgrenciEkleModal onKapat={()=>setModalAcik(false)} onEkle={()=>{signOut(auth).then(()=>window.location.reload());}}/>}
      <div style={{width:'220px',background:s.surface,borderRight:`1px solid ${s.border}`,padding:'24px 12px',display:'flex',flexDirection:'column',gap:'4px',flexShrink:0}}>
        <div style={{fontSize:'22px',fontWeight:'bold',color:s.text,marginBottom:'8px',paddingLeft:'10px'}}>Koç<span style={{color:s.accent}}>Panel</span></div>
        <div style={{fontSize:'11px',color:s.text3,paddingLeft:'10px',marginBottom:'12px'}}>{kullanici.email}</div>
        {menu.map(item=>(
          <div key={item.label} onClick={item.cikis?onCikis:item.sayfa?()=>setAktifSayfa(item.sayfa):undefined} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',borderRadius:'10px',background:item.cikis?'rgba(255,107,107,0.08)':item.sayfa===aktifSayfa?s.accentSoft:'transparent',color:item.cikis?'#FF6B6B':item.sayfa===aktifSayfa?'#A09DFF':s.text2,cursor:'pointer',fontSize:'13.5px',fontWeight:item.sayfa===aktifSayfa||item.cikis?'600':'400',border:item.cikis?'1px solid rgba(255,107,107,0.15)':'1px solid transparent',position:'relative'}}>
            <span>{item.icon}</span>
            <span style={{flex:1}}>{item.label}</span>
            {item.badge>0&&<span style={{background:'#FF6B6B',color:'white',fontSize:'10px',fontWeight:'700',padding:'2px 6px',borderRadius:'20px',minWidth:'18px',textAlign:'center'}}>{item.badge}</span>}
          </div>
        ))}
      </div>
      <div style={{flex:1,padding:'32px',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'28px'}}>
          <div>
            <div style={{fontSize:'28px',fontWeight:'bold',color:s.text}}>Hoş geldin, <span style={{color:s.accent}}>Koç</span> 👋</div>
            <div style={{color:s.text2,fontSize:'13px',marginTop:'4px'}}>Pathwise Mentor's</div>
          </div>
          <button onClick={()=>setModalAcik(true)} style={{background:s.accentSoft,border:`2px solid ${s.accent}`,color:'#A09DFF',padding:'10px 20px',borderRadius:'10px',cursor:'pointer',fontSize:'14px',fontWeight:'700'}}>+ Öğrenci Ekle</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'24px'}}>
          {[
            {label:'Aktif Öğrenci',value:String(ogrenciler.length),sub:'Toplam',renk:'#A09DFF'},
            {label:'Program Tamamlama',value:'%'+ortTamamlama,sub:'Tüm öğrenciler ort.',renk:'#34C98A'},
            {label:'Bekleyen Analiz',value:'3',sub:'Yorum bekleniyor',renk:'#FFA040'},
            {label:'Yeni Mesaj',value:String(okunmamisMesaj),sub:'Öğrencilerden',renk:'#FF6B6B'},
          ].map(k=>(
            <div key={k.label} style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'14px',padding:'18px 20px'}}>
              <div style={{fontSize:'11px',color:s.text2,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'8px'}}>{k.label}</div>
              <div style={{fontSize:'34px',fontWeight:'bold',color:k.renk,lineHeight:1}}>{k.value}</div>
              <div style={{fontSize:'11.5px',color:s.text3,marginTop:'6px'}}>{k.sub}</div>
            </div>
          ))}
        </div>
        <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',overflow:'hidden'}}>
          <div style={{padding:'16px 20px',borderBottom:`1px solid ${s.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{color:s.text,fontWeight:'600'}}>👥 Öğrencilerim</div>
            <div style={{color:s.accent,fontSize:'12px',cursor:'pointer'}} onClick={()=>setModalAcik(true)}>+ Yeni Ekle</div>
          </div>
          {yukleniyor?<div style={{padding:'30px',textAlign:'center',color:s.text3}}>Yükleniyor...</div>:
          ogrenciler.length===0?<div style={{padding:'40px',textAlign:'center'}}><div style={{fontSize:'32px',marginBottom:'12px'}}>👥</div><div style={{color:s.text2,fontSize:'14px'}}>Henüz öğrenci yok</div></div>:
          ogrenciler.map((o,i)=>(
            <div key={o.id} onClick={()=>setSeciliOgrenci(o)} style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 20px',borderBottom:`1px solid ${s.border}`,cursor:'pointer'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'50%',background:renkler[i%renkler.length]+'33',display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'13px',flexShrink:0}}>
                {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div style={{flex:1}}>
                <div style={{color:s.text,fontSize:'13.5px',fontWeight:'500'}}>{o.isim}</div>
                <div style={{color:s.text2,fontSize:'11.5px'}}>{o.tur} · {o.email}</div>
              </div>
              <div style={{color:s.accent,fontSize:'13px'}}>→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== GİRİŞ =====
function GirisEkrani({onGiris}){
  const[email,setEmail]=useState('');const[sifre,setSifre]=useState('');
  const[hata,setHata]=useState('');const[yukleniyor,setYukleniyor]=useState(false);
  const girisYap=async()=>{
    setYukleniyor(true);setHata('');
    try{const sonuc=await signInWithEmailAndPassword(auth,email,sifre);
    const kd=await getDoc(doc(db,'kullanicilar',sonuc.user.uid));
    let rol='koc';let data=null;
    if(kd.exists()){rol=kd.data().rol||'ogrenci';data=kd.data();}
    onGiris(sonuc.user,rol,data);}catch(e){setHata('Email veya şifre hatalı!');}
    setYukleniyor(false);
  };
  return(
    <div style={{minHeight:'100vh',background:s.bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{fontSize:'36px',fontWeight:'bold',color:s.text,marginBottom:'8px'}}>Koç<span style={{color:s.accent}}>Panel</span></div>
      <div style={{color:s.text2,fontSize:'14px',marginBottom:'48px'}}>Pathwise Mentor's</div>
      <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'20px',padding:'40px',width:'380px'}}>
        <div style={{color:s.text,fontSize:'20px',fontWeight:'600',marginBottom:'24px'}}>Giriş Yap</div>
        <div style={{marginBottom:'14px'}}>
          <div style={{color:s.text2,fontSize:'12px',marginBottom:'6px'}}>Email</div>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@ornek.com" style={{width:'100%',background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'12px 14px',color:s.text,fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div style={{marginBottom:'20px'}}>
          <div style={{color:s.text2,fontSize:'12px',marginBottom:'6px'}}>Şifre</div>
          <input type="password" value={sifre} onChange={e=>setSifre(e.target.value)} placeholder="••••••••" style={{width:'100%',background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'12px 14px',color:s.text,fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
        </div>
        {hata&&<div style={{color:'#FF6B6B',fontSize:'13px',marginBottom:'14px'}}>{hata}</div>}
        <button onClick={girisYap} disabled={yukleniyor||!email||!sifre} style={{width:'100%',padding:'14px',background:email&&sifre?s.accentSoft:'#2A2B3D',color:email&&sifre?'#A09DFF':s.text3,border:email&&sifre?`2px solid ${s.accent}`:`2px solid ${s.border}`,borderRadius:'12px',fontSize:'15px',fontWeight:'700',cursor:email&&sifre?'pointer':'not-allowed'}}>
          {yukleniyor?'Giriş yapılıyor...':'Giriş Yap →'}
        </button>
      </div>
    </div>
  );
}

// ===== ANA APP =====
function App(){
  const[kullanici,setKullanici]=useState(null);
  const[rol,setRol]=useState('');
  const[userData,setUserData]=useState(null);
  const girisYap=(u,r,d)=>{setKullanici(u);setRol(r);setUserData(d);};
  const cikisYap=async()=>{await signOut(auth);setKullanici(null);setRol('');setUserData(null);};
  if(kullanici&&rol==='ogrenci')return<OgrenciPaneli kullanici={kullanici} ogrenciData={userData} onCikis={cikisYap}/>;
  if(kullanici&&rol==='veli')return<VeliPaneli kullanici={kullanici} veliData={userData} onCikis={cikisYap}/>;
  if(kullanici)return<KocPaneli kullanici={kullanici} onCikis={cikisYap}/>;
  return<GirisEkrani onGiris={girisYap}/>;
}

export default App;
