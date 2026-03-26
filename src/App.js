/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, updateDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const renkler = ['#5B4FE8','#10B981','#F43F5E','#F59E0B','#3B82F6','#EC4899'];

// TEMA - gece 21:00 - sabah 09:00 arası koyu
function getTema() {
  const saat = new Date().getHours();
  return (saat >= 21 || saat < 9) ? 'dark' : 'light';
}

function useTheme() {
  const [tema, setTema] = useState(getTema());
  useEffect(() => {
    const interval = setInterval(() => setTema(getTema()), 60000);
    return () => clearInterval(interval);
  }, []);
  return tema;
}

function getS(tema) {
  if (tema === 'dark') return {
    bg: '#0F0F1A', surface: '#1A1A2E', surface2: '#242438', surface3: '#2E2E48',
    border: '#333355', accent: '#5B4FE8', accentSoft: 'rgba(91,79,232,0.15)',
    accentGrad: 'linear-gradient(135deg, #5B4FE8, #8B7FF5)',
    text: '#F0F0FF', text2: '#9999BB', text3: '#555577',
    shadow: '0 4px 20px rgba(0,0,0,0.4)',
  };
  return {
    bg: '#F4F3FF', surface: '#FFFFFF', surface2: '#F8F7FF', surface3: '#EEECff',
    border: '#E5E3FF', accent: '#5B4FE8', accentSoft: 'rgba(91,79,232,0.1)',
    accentGrad: 'linear-gradient(135deg, #5B4FE8, #8B7FF5)',
    text: '#1A1730', text2: '#6B6785', text3: '#B0ADCC',
    shadow: '0 4px 20px rgba(91,79,232,0.08)',
  };
}

const TYT_DERSLER=[{id:'tur',label:'Türkçe',toplam:40,renk:'#F59E0B'},{id:'mat',label:'Temel Matematik',toplam:40,renk:'#5B4FE8'},{id:'fen',label:'Fen Bilimleri',toplam:20,renk:'#10B981'},{id:'sos',label:'Sosyal Bilimler',toplam:20,renk:'#F43F5E'}];
const AYT_DERSLER=[{id:'mat',label:'Matematik',toplam:30,renk:'#5B4FE8'},{id:'fiz',label:'Fizik',toplam:14,renk:'#3B82F6'},{id:'kim',label:'Kimya',toplam:13,renk:'#10B981'},{id:'biy',label:'Biyoloji',toplam:13,renk:'#EC4899'},{id:'ede',label:'Edebiyat',toplam:24,renk:'#F59E0B'},{id:'tar',label:'Tarih',toplam:10,renk:'#F43F5E'},{id:'cog',label:'Coğrafya',toplam:6,renk:'#8B5CF6'}];

function netHesapla(d,y){return Math.max(0,d-(y/4)).toFixed(2);}
function verimlilikHesapla(c,b,g){if(b===0)return 0;const o=Math.min(c/b,1.5);return Math.min(Math.round(((o+g/100)/2)*100),100);}
function verimlilikDurum(v){
  if(v<=20)return{emoji:'🔴',label:'Çalışmadı',renk:'#F43F5E'};
  if(v<=40)return{emoji:'🟠',label:'Yetersiz',renk:'#F97316'};
  if(v<=60)return{emoji:'🟡',label:'Orta',renk:'#F59E0B'};
  if(v<=80)return{emoji:'🟢',label:'İyi',renk:'#10B981'};
  return{emoji:'💎',label:'Mükemmel',renk:'#5B4FE8'};
}

// ===== SHARED COMPONENTS =====
function TopBar({tema, kullanici, rol, onCikis, title}) {
  const s = getS(tema);
  const rolRenk = rol==='koc'?'#5B4FE8':rol==='ogrenci'?'#10B981':'#F59E0B';
  const rolLabel = rol==='koc'?'Koç':rol==='ogrenci'?'Öğrenci':'Veli';
  return (
    <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'0 28px',height:'64px',display:'flex',alignItems:'center',gap:'16px',boxShadow:s.shadow,position:'sticky',top:0,zIndex:100}}>
      <div style={{fontWeight:'800',fontSize:'22px',background:s.accentGrad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
        Elsway
      </div>
      {title&&<div style={{fontSize:'15px',fontWeight:'600',color:s.text,marginLeft:'8px'}}>{title}</div>}
      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'12px'}}>
        <div style={{background:`${rolRenk}20`,color:rolRenk,padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:'600'}}>{rolLabel}</div>
        <div style={{fontSize:'13px',color:s.text2}}>{kullanici?.email}</div>
        <button onClick={onCikis} style={{background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.2)',color:'#F43F5E',padding:'7px 14px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'600'}}>Çıkış</button>
      </div>
    </div>
  );
}

function SideNav({tema, menu, aktif, onSelect}) {
  const s = getS(tema);
  return (
    <div style={{width:'240px',background:s.surface,borderRight:`1px solid ${s.border}`,padding:'20px 12px',display:'flex',flexDirection:'column',gap:'2px',flexShrink:0,minHeight:'calc(100vh - 64px)'}}>
      {menu.map(item=>(
        <div key={item.label} onClick={()=>onSelect(item)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',borderRadius:'10px',background:aktif===item.key?s.accentSoft:'transparent',color:aktif===item.key?s.accent:s.text2,cursor:'pointer',fontSize:'13.5px',fontWeight:aktif===item.key?'600':'400',transition:'all 0.15s',position:'relative'}}>
          <span style={{fontSize:'16px'}}>{item.icon}</span>
          <span style={{flex:1}}>{item.label}</span>
          {item.badge>0&&<span style={{background:'#F43F5E',color:'white',fontSize:'10px',fontWeight:'700',padding:'2px 6px',borderRadius:'20px'}}>{item.badge}</span>}
          {aktif===item.key&&<div style={{position:'absolute',left:0,top:'20%',bottom:'20%',width:'3px',background:s.accent,borderRadius:'0 3px 3px 0'}}/>}
        </div>
      ))}
    </div>
  );
}

function Card({tema, children, style={}}) {
  const s = getS(tema);
  return <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'16px',overflow:'hidden',boxShadow:s.shadow,...style}}>{children}</div>;
}

function StatCard({tema, label, value, sub, renk, icon}) {
  const s = getS(tema);
  return (
    <Card tema={tema} style={{padding:'20px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,right:0,width:'80px',height:'80px',background:`${renk}10`,borderRadius:'0 16px 0 80px'}}/>
      <div style={{fontSize:'22px',marginBottom:'8px'}}>{icon}</div>
      <div style={{fontSize:'11px',color:s.text2,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:'6px'}}>{label}</div>
      <div style={{fontSize:'32px',fontWeight:'700',color:renk,lineHeight:1}}>{value}</div>
      <div style={{fontSize:'12px',color:s.text3,marginTop:'6px'}}>{sub}</div>
    </Card>
  );
}

function Btn({tema, children, onClick, disabled, variant='primary', style={}}) {
  const s = getS(tema);
  const base = {padding:'11px 20px',borderRadius:'10px',cursor:disabled?'not-allowed':'pointer',fontSize:'14px',fontWeight:'600',border:'none',transition:'all 0.15s',...style};
  if(variant==='primary') return <button onClick={onClick} disabled={disabled} style={{...base,background:disabled?s.surface3:s.accentGrad,color:disabled?s.text3:'white',opacity:disabled?0.6:1}}>{children}</button>;
  if(variant==='outline') return <button onClick={onClick} disabled={disabled} style={{...base,background:'transparent',color:s.accent,border:`1px solid ${s.border}`}}>{children}</button>;
  if(variant==='danger') return <button onClick={onClick} disabled={disabled} style={{...base,background:'rgba(244,63,94,0.1)',color:'#F43F5E',border:'1px solid rgba(244,63,94,0.2)'}}>{children}</button>;
  return <button onClick={onClick} disabled={disabled} style={{...base,background:s.surface2,color:s.text2,border:`1px solid ${s.border}`}}>{children}</button>;
}

function Input({tema, value, onChange, placeholder, type='text'}) {
  const s = getS(tema);
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{width:'100%',background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'12px 14px',color:s.text,fontSize:'14px',outline:'none',boxSizing:'border-box',transition:'border 0.15s'}} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>;
}

// ===== MESAJLAŞMA =====
function MesajEkrani({tema, ogrenciId, gonderen}){
  const s=getS(tema);
  const[mesajlar,setMesajlar]=useState([]);
  const[yeniMesaj,setYeniMesaj]=useState('');
  const[yukleniyor,setYukleniyor]=useState(false);
  const getir=async()=>{
    try{const snap=await getDocs(collection(db,'ogrenciler',ogrenciId,'mesajlar'));
    const liste=snap.docs.map(d=>({id:d.id,...d.data()}));
    liste.sort((a,b)=>(a.olusturma?.seconds||0)-(b.olusturma?.seconds||0));
    setMesajlar(liste);}catch(e){}
  };
  useEffect(()=>{getir();},[ogrenciId]);
  const gonder=async()=>{
    if(!yeniMesaj.trim())return;setYukleniyor(true);
    try{await addDoc(collection(db,'ogrenciler',ogrenciId,'mesajlar'),{mesaj:yeniMesaj,gonderen,olusturma:new Date()});setYeniMesaj('');await getir();}catch(e){alert(e.message);}
    setYukleniyor(false);
  };
  return(
    <Card tema={tema} style={{display:'flex',flexDirection:'column',height:'520px'}}>
      <div style={{flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:'12px'}}>
        {mesajlar.length===0?<div style={{textAlign:'center',padding:'60px',color:s.text3}}><div style={{fontSize:'40px',marginBottom:'12px'}}>💬</div><div>Henüz mesaj yok</div></div>:
        mesajlar.map(m=>{const benim=m.gonderen===gonderen;return(
          <div key={m.id} style={{display:'flex',flexDirection:'column',alignItems:benim?'flex-end':'flex-start'}}>
            <div style={{maxWidth:'75%',background:benim?s.accentGrad:s.surface2,borderRadius:benim?'18px 18px 4px 18px':'18px 18px 18px 4px',padding:'12px 16px',boxShadow:s.shadow}}>
              <div style={{fontSize:'14px',color:benim?'white':s.text,lineHeight:'1.6'}}>{m.mesaj}</div>
            </div>
            <div style={{fontSize:'11px',color:s.text3,marginTop:'4px'}}>
              <span style={{color:benim?s.accent:'#10B981',fontWeight:'600'}}>{m.gonderen==='koc'?'Koç':'Öğrenci'}</span>
              {' · '}{m.olusturma?.toDate?m.olusturma.toDate().toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}):''}
            </div>
          </div>
        );})}
      </div>
      <div style={{padding:'16px',borderTop:`1px solid ${s.border}`,display:'flex',gap:'10px'}}>
        <Input tema={tema} value={yeniMesaj} onChange={e=>setYeniMesaj(e.target.value)} placeholder="Mesaj yaz... (Enter)" type="text"/>
        <Btn tema={tema} onClick={gonder} disabled={!yeniMesaj.trim()||yukleniyor}>{yukleniyor?'...':'Gönder →'}</Btn>
      </div>
    </Card>
  );
}

// ===== KOÇ MESAJLAR =====
function KocMesajlarSayfasi({tema, ogrenciler, onGeri}){
  const s=getS(tema);
  const[secili,setSecili]=useState(ogrenciler[0]||null);
  return(
    <div style={{display:'flex',flex:1,minHeight:'calc(100vh - 64px)'}}>
      <div style={{width:'280px',background:s.surface,borderRight:`1px solid ${s.border}`,overflowY:'auto'}}>
        <div style={{padding:'16px',borderBottom:`1px solid ${s.border}`,display:'flex',alignItems:'center',gap:'10px'}}>
          <Btn tema={tema} onClick={onGeri} variant="outline" style={{padding:'6px 12px',fontSize:'12px'}}>← Geri</Btn>
          <div style={{fontWeight:'600',color:s.text}}>Mesajlar</div>
        </div>
        {ogrenciler.map((o,i)=>(
          <div key={o.id} onClick={()=>setSecili(o)} style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 16px',borderBottom:`1px solid ${s.border}`,cursor:'pointer',background:secili?.id===o.id?s.accentSoft:'transparent',transition:'background 0.15s'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'50%',background:`${renkler[i%renkler.length]}20`,display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'13px',flexShrink:0}}>
              {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div style={{flex:1}}>
              <div style={{color:secili?.id===o.id?s.accent:s.text,fontSize:'13.5px',fontWeight:'500'}}>{o.isim}</div>
              <div style={{color:s.text3,fontSize:'11.5px'}}>{o.tur}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{flex:1,padding:'24px',background:s.bg}}>
        {secili?<MesajEkrani tema={tema} ogrenciId={secili.id} gonderen="koc"/>:
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:s.text3}}>Öğrenci seç</div>}
      </div>
    </div>
  );
}

// ===== HAFTALIK PROGRAM SAYFASI =====
function HaftalikProgramSayfasi({tema, ogrenciler, onGeri}){
  const s=getS(tema);
  const[veriler,setVeriler]=useState({});
  const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{
      const obj={};
      for(const o of ogrenciler){try{const snap=await getDocs(collection(db,'ogrenciler',o.id,'program'));obj[o.id]=snap.docs.map(d=>({id:d.id,...d.data()}));}catch(e){}}
      setVeriler(obj);setYukleniyor(false);
    };getir();
  },[]);
  return(
    <div style={{padding:'28px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
        <Btn tema={tema} onClick={onGeri} variant="outline" style={{padding:'8px 16px'}}>← Geri</Btn>
        <h2 style={{fontSize:'20px',fontWeight:'700',color:getS(tema).text}}>📅 Haftalık Program</h2>
      </div>
      {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:getS(tema).text3}}>Yükleniyor...</div>:
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'16px'}}>
        {ogrenciler.map((o,i)=>{
          const prog=veriler[o.id]||[];const tam=prog.filter(p=>p.tamamlandi).length;const oran=prog.length>0?Math.round((tam/prog.length)*100):0;
          return(
            <Card key={o.id} tema={tema}>
              <div style={{padding:'16px 20px',borderBottom:`1px solid ${getS(tema).border}`,display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:`${renkler[i%renkler.length]}20`,display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'13px'}}>
                  {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div style={{flex:1}}><div style={{color:getS(tema).text,fontWeight:'600'}}>{o.isim}</div><div style={{color:getS(tema).text2,fontSize:'12px'}}>{o.tur}</div></div>
                <div style={{fontSize:'20px',fontWeight:'700',color:oran>=80?'#10B981':oran>=50?'#F59E0B':'#F43F5E'}}>{oran}%</div>
              </div>
              <div style={{padding:'16px 20px'}}>
                <div style={{height:'6px',background:getS(tema).surface3,borderRadius:'6px',overflow:'hidden',marginBottom:'12px'}}>
                  <div style={{height:'100%',width:oran+'%',background:oran>=80?'#10B981':oran>=50?'#F59E0B':'#F43F5E',borderRadius:'6px',transition:'width 0.5s'}}/>
                </div>
                {prog.length===0?<div style={{color:getS(tema).text3,fontSize:'12px',textAlign:'center',padding:'8px'}}>Program eklenmedi</div>:
                prog.slice(0,5).map(p=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'7px 0',borderBottom:`1px solid ${getS(tema).border}`}}>
                    <div style={{width:'18px',height:'18px',borderRadius:'5px',background:p.tamamlandi?'#10B981':getS(tema).surface3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'white',flexShrink:0}}>{p.tamamlandi&&'✓'}</div>
                    <div style={{flex:1,fontSize:'13px',color:p.tamamlandi?getS(tema).text3:getS(tema).text,textDecoration:p.tamamlandi?'line-through':'none'}}>{p.gorev}</div>
                    <div style={{fontSize:'11px',color:getS(tema).text3,background:getS(tema).surface2,padding:'2px 8px',borderRadius:'20px'}}>{p.ders}</div>
                  </div>
                ))}
                {prog.length>5&&<div style={{fontSize:'12px',color:getS(tema).text3,textAlign:'center',marginTop:'8px'}}>+{prog.length-5} görev daha</div>}
              </div>
            </Card>
          );
        })}
      </div>}
    </div>
  );
}

// ===== GÜNLÜK TAKİP =====
function GunlukTakipSayfasi({tema, ogrenciler, onGeri}){
  const s=getS(tema);const bugun=new Date().toISOString().split('T')[0];
  const[veriler,setVeriler]=useState({});const[calisma,setCalisma]=useState({});const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{
      const progObj={},calObj={};
      for(const o of ogrenciler){try{const snap=await getDocs(collection(db,'ogrenciler',o.id,'program'));progObj[o.id]=snap.docs.map(d=>({id:d.id,...d.data()}));const cs=await getDoc(doc(db,'ogrenciler',o.id,'calisma',bugun));if(cs.exists())calObj[o.id]=cs.data();}catch(e){}}
      setVeriler(progObj);setCalisma(calObj);setYukleniyor(false);
    };getir();
  },[]);
  return(
    <div style={{padding:'28px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
        <Btn tema={tema} onClick={onGeri} variant="outline" style={{padding:'8px 16px'}}>← Geri</Btn>
        <h2 style={{fontSize:'20px',fontWeight:'700',color:s.text}}>✅ Günlük Takip — {bugun}</h2>
      </div>
      {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:
      <Card tema={tema}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 100px 100px 100px 130px',gap:'0',padding:'12px 20px',background:s.surface2,borderBottom:`1px solid ${s.border}`}}>
          {['Öğrenci','Görev','Tamamlama','Çalışma','Verimlilik'].map(h=><div key={h} style={{fontSize:'11px',color:s.text3,fontWeight:'600',textTransform:'uppercase',textAlign:h==='Öğrenci'?'left':'center'}}>{h}</div>)}
        </div>
        {ogrenciler.map((o,i)=>{
          const prog=veriler[o.id]||[];const tam=prog.filter(p=>p.tamamlandi).length;const oran=prog.length>0?Math.round((tam/prog.length)*100):0;
          const cal=calisma[o.id];const ver=cal?verimlilikDurum(cal.verimlilik):null;
          return(
            <div key={o.id} style={{display:'grid',gridTemplateColumns:'1fr 100px 100px 100px 130px',padding:'14px 20px',borderBottom:`1px solid ${s.border}`,alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{width:'34px',height:'34px',borderRadius:'50%',background:`${renkler[i%renkler.length]}20`,display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'12px'}}>
                  {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div><div style={{color:s.text,fontSize:'13.5px',fontWeight:'500'}}>{o.isim}</div><div style={{color:s.text2,fontSize:'11px'}}>{o.tur}</div></div>
              </div>
              <div style={{textAlign:'center',fontSize:'13px',color:s.text2}}>{tam}/{prog.length}</div>
              <div style={{textAlign:'center',fontSize:'15px',fontWeight:'700',color:oran>=80?'#10B981':oran>=50?'#F59E0B':'#F43F5E'}}>{oran}%</div>
              <div style={{textAlign:'center',fontSize:'13px',color:cal?s.text:s.text3}}>{cal?cal.saat+'s':'—'}</div>
              <div style={{textAlign:'center'}}>{ver?<div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}><span>{ver.emoji}</span><span style={{fontSize:'12px',fontWeight:'600',color:ver.renk}}>{ver.label}</span></div>:<span style={{fontSize:'12px',color:s.text3}}>Giriş yok</span>}</div>
            </div>
          );
        })}
      </Card>}
    </div>
  );
}

// ===== DENEME YÖNETİMİ =====
function DenemeYonetimiSayfasi({tema, ogrenciler, onGeri}){
  const s=getS(tema);
  const[veriler,setVeriler]=useState({});const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{
      const obj={};
      for(const o of ogrenciler){try{const snap=await getDocs(collection(db,'ogrenciler',o.id,'denemeler'));const liste=snap.docs.map(d=>({id:d.id,...d.data()}));liste.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));obj[o.id]=liste;}catch(e){}}
      setVeriler(obj);setYukleniyor(false);
    };getir();
  },[]);
  return(
    <div style={{padding:'28px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
        <Btn tema={tema} onClick={onGeri} variant="outline" style={{padding:'8px 16px'}}>← Geri</Btn>
        <h2 style={{fontSize:'20px',fontWeight:'700',color:s.text}}>📊 Deneme Yönetimi</h2>
      </div>
      {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'16px'}}>
        {ogrenciler.map((o,i)=>{
          const den=veriler[o.id]||[];const son=den[0];const onc=den[1];
          const fark=son&&onc?(parseFloat(son.toplamNet)-parseFloat(onc.toplamNet)).toFixed(1):null;
          return(
            <Card key={o.id} tema={tema}>
              <div style={{padding:'16px 20px',borderBottom:`1px solid ${s.border}`,display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'50%',background:`${renkler[i%renkler.length]}20`,display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'13px'}}>
                  {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div style={{flex:1}}><div style={{color:s.text,fontWeight:'600'}}>{o.isim}</div><div style={{color:s.text2,fontSize:'12px'}}>{den.length} deneme</div></div>
                {son&&<div style={{textAlign:'right'}}><div style={{fontSize:'22px',fontWeight:'700',color:s.accent}}>{son.toplamNet}</div><div style={{fontSize:'10px',color:s.text3}}>{son.sinav} net</div></div>}
              </div>
              <div style={{padding:'16px 20px'}}>
                {den.length===0?<div style={{color:s.text3,fontSize:'13px',textAlign:'center',padding:'12px'}}>Deneme sonucu yok</div>:<>
                  {fark!==null&&<div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px',padding:'10px 14px',background:parseFloat(fark)>=0?'rgba(16,185,129,0.1)':'rgba(244,63,94,0.1)',borderRadius:'10px',border:`1px solid ${parseFloat(fark)>=0?'#10B981':'#F43F5E'}`}}>
                    <span style={{fontSize:'16px'}}>{parseFloat(fark)>=0?'📈':'📉'}</span>
                    <span style={{fontSize:'13px',fontWeight:'600',color:parseFloat(fark)>=0?'#10B981':'#F43F5E'}}>{parseFloat(fark)>=0?'+':''}{fark} net değişim</span>
                  </div>}
                  {den.slice(0,3).map(d=>(
                    <div key={d.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',borderBottom:`1px solid ${s.border}`}}>
                      <div style={{background:s.accentSoft,color:s.accent,padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'700'}}>{d.sinav}</div>
                      <div style={{fontSize:'12px',color:s.text2,flex:1}}>{d.tarih}</div>
                      <div style={{fontSize:'15px',fontWeight:'700',color:s.accent}}>{d.toplamNet}</div>
                    </div>
                  ))}
                </>}
              </div>
            </Card>
          );
        })}
      </div>}
    </div>
  );
}

// ===== İSTATİSTİKLER =====
function IstatistiklerSayfasi({tema, ogrenciler, onGeri}){
  const s=getS(tema);
  const[veriler,setVeriler]=useState({prog:{},den:{},cal:{}});const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{
      const prog={},den={},cal={};
      for(const o of ogrenciler){try{const ps=await getDocs(collection(db,'ogrenciler',o.id,'program'));prog[o.id]=ps.docs.map(d=>({id:d.id,...d.data()}));const ds=await getDocs(collection(db,'ogrenciler',o.id,'denemeler'));den[o.id]=ds.docs.map(d=>({id:d.id,...d.data()}));const cs=await getDocs(collection(db,'ogrenciler',o.id,'calisma'));cal[o.id]=cs.docs.map(d=>({tarih:d.id,...d.data()}));}catch(e){}}
      setVeriler({prog,den,cal});setYukleniyor(false);
    };getir();
  },[]);
  const n=ogrenciler.length;
  const ortTam=n>0?Math.round(ogrenciler.reduce((a,o)=>{const p=veriler.prog[o.id]||[];const t=p.filter(x=>x.tamamlandi).length;return a+(p.length>0?Math.round((t/p.length)*100):0);},0)/n):0;
  const topDen=Object.values(veriler.den).reduce((a,v)=>a+v.length,0);
  const ortCal=n>0?Math.round(Object.values(veriler.cal).reduce((a,v)=>a+v.reduce((b,c)=>b+(c.saat||0),0),0)/n*10)/10:0;
  return(
    <div style={{padding:'28px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
        <Btn tema={tema} onClick={onGeri} variant="outline" style={{padding:'8px 16px'}}>← Geri</Btn>
        <h2 style={{fontSize:'20px',fontWeight:'700',color:s.text}}>📈 İstatistikler</h2>
      </div>
      {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:<>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'24px'}}>
        <StatCard tema={tema} label="Toplam Öğrenci" value={n} sub="Aktif" renk="#5B4FE8" icon="👥"/>
        <StatCard tema={tema} label="Ort. Tamamlama" value={'%'+ortTam} sub="Tüm öğrenciler" renk="#10B981" icon="✅"/>
        <StatCard tema={tema} label="Toplam Deneme" value={topDen} sub="Girilmiş" renk="#F59E0B" icon="📊"/>
        <StatCard tema={tema} label="Ort. Çalışma" value={ortCal+'s'} sub="Kişi başı" renk="#3B82F6" icon="⏱️"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <Card tema={tema} style={{padding:'20px'}}>
          <div style={{fontWeight:'600',fontSize:'14px',color:s.text,marginBottom:'16px'}}>Program Tamamlama</div>
          {ogrenciler.map((o,i)=>{const p=veriler.prog[o.id]||[];const t=p.filter(x=>x.tamamlandi).length;const oran=p.length>0?Math.round((t/p.length)*100):0;return(
            <div key={o.id} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
              <div style={{width:'110px',fontSize:'12px',color:s.text,fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.isim.split(' ')[0]}</div>
              <div style={{flex:1,height:'8px',background:s.surface3,borderRadius:'8px',overflow:'hidden'}}><div style={{height:'100%',width:oran+'%',background:renkler[i%renkler.length],borderRadius:'8px',transition:'width 0.5s'}}/></div>
              <div style={{fontSize:'12px',fontWeight:'700',color:renkler[i%renkler.length],width:'36px',textAlign:'right'}}>{oran}%</div>
            </div>
          );})}
        </Card>
        <Card tema={tema} style={{padding:'20px'}}>
          <div style={{fontWeight:'600',fontSize:'14px',color:s.text,marginBottom:'16px'}}>Son Deneme Netleri</div>
          {ogrenciler.map((o,i)=>{const d=veriler.den[o.id]||[];d.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));const son=d[0];const oran=son?Math.round((parseFloat(son.toplamNet)/120)*100):0;return(
            <div key={o.id} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
              <div style={{width:'110px',fontSize:'12px',color:s.text,fontWeight:'500',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.isim.split(' ')[0]}</div>
              <div style={{flex:1,height:'8px',background:s.surface3,borderRadius:'8px',overflow:'hidden'}}><div style={{height:'100%',width:oran+'%',background:'#5B4FE8',borderRadius:'8px'}}/></div>
              <div style={{fontSize:'12px',fontWeight:'700',color:'#5B4FE8',width:'60px',textAlign:'right'}}>{son?son.toplamNet+' net':'—'}</div>
            </div>
          );})}
        </Card>
      </div>
      </>}
    </div>
  );
}

// ===== HEDEF TAKİBİ =====
function HedefTakibiSayfasi({tema, ogrenciler, onGeri}){
  const s=getS(tema);
  const[hedefler,setHedefler]=useState({});const[yeniHedef,setYeniHedef]=useState({});const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{const obj={};for(const o of ogrenciler){try{const snap=await getDocs(collection(db,'ogrenciler',o.id,'hedefler'));obj[o.id]=snap.docs.map(d=>({id:d.id,...d.data()}));}catch(e){}}setHedefler(obj);setYukleniyor(false);};getir();
  },[]);
  const hedefEkle=async(oid)=>{const h=yeniHedef[oid];if(!h?.baslik||!h?.deger)return;try{await addDoc(collection(db,'ogrenciler',oid,'hedefler'),{baslik:h.baslik,deger:h.deger,olusturma:new Date()});setYeniHedef(prev=>({...prev,[oid]:{baslik:'',deger:''}}));const snap=await getDocs(collection(db,'ogrenciler',oid,'hedefler'));setHedefler(prev=>({...prev,[oid]:snap.docs.map(d=>({id:d.id,...d.data()}))}));}catch(e){alert(e.message);}};
  return(
    <div style={{padding:'28px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
        <Btn tema={tema} onClick={onGeri} variant="outline" style={{padding:'8px 16px'}}>← Geri</Btn>
        <h2 style={{fontSize:'20px',fontWeight:'700',color:s.text}}>🎯 Hedef Takibi</h2>
      </div>
      {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'16px'}}>
        {ogrenciler.map((o,i)=>{const hList=hedefler[o.id]||[];const yh=yeniHedef[o.id]||{baslik:'',deger:''};return(
          <Card key={o.id} tema={tema}>
            <div style={{padding:'14px 20px',borderBottom:`1px solid ${s.border}`,display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{width:'34px',height:'34px',borderRadius:'50%',background:`${renkler[i%renkler.length]}20`,display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'12px'}}>
                {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div style={{color:s.text,fontWeight:'600'}}>{o.isim}</div>
            </div>
            <div style={{padding:'16px 20px'}}>
              <div style={{display:'flex',gap:'8px',marginBottom:'12px'}}>
                <input value={yh.baslik} onChange={e=>setYeniHedef(prev=>({...prev,[o.id]:{...prev[o.id],baslik:e.target.value}}))} placeholder="Hedef (örn: TYT Net)" style={{flex:1,background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'8px',padding:'8px 12px',color:s.text,fontSize:'13px',outline:'none'}}/>
                <input value={yh.deger} onChange={e=>setYeniHedef(prev=>({...prev,[o.id]:{...prev[o.id],deger:e.target.value}}))} placeholder="Değer" style={{width:'70px',background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'8px',padding:'8px 12px',color:s.text,fontSize:'13px',outline:'none'}}/>
                <Btn tema={tema} onClick={()=>hedefEkle(o.id)} style={{padding:'8px 12px',fontSize:'14px'}}>+</Btn>
              </div>
              {hList.length===0?<div style={{color:s.text3,fontSize:'13px',textAlign:'center',padding:'8px'}}>Henüz hedef yok</div>:
              hList.map(h=>(
                <div key={h.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 12px',background:s.surface2,borderRadius:'10px',marginBottom:'6px'}}>
                  <span style={{fontSize:'16px'}}>🎯</span>
                  <div style={{flex:1,fontSize:'13px',color:s.text}}>{h.baslik}</div>
                  <div style={{fontSize:'15px',fontWeight:'700',color:s.accent}}>{h.deger}</div>
                </div>
              ))}
            </div>
          </Card>
        );})}
      </div>}
    </div>
  );
}

// ===== VELİ RAPORLARI =====
function VeliRaporlariSayfasi({tema, ogrenciler, onGeri}){
  const s=getS(tema);
  const[veriler,setVeriler]=useState({});const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{
    const getir=async()=>{const obj={};for(const o of ogrenciler){try{const ps=await getDocs(collection(db,'ogrenciler',o.id,'program'));const prog=ps.docs.map(d=>({id:d.id,...d.data()}));const ds=await getDocs(collection(db,'ogrenciler',o.id,'denemeler'));const den=ds.docs.map(d=>({id:d.id,...d.data()}));den.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));obj[o.id]={prog,den};}catch(e){}}setVeriler(obj);setYukleniyor(false);};getir();
  },[]);
  return(
    <div style={{padding:'28px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
        <Btn tema={tema} onClick={onGeri} variant="outline" style={{padding:'8px 16px'}}>← Geri</Btn>
        <h2 style={{fontSize:'20px',fontWeight:'700',color:s.text}}>📋 Veli Raporları</h2>
      </div>
      {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:
      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {ogrenciler.map((o,i)=>{const d=veriler[o.id]||{prog:[],den:[]};const tam=d.prog.filter(p=>p.tamamlandi).length;const oran=d.prog.length>0?Math.round((tam/d.prog.length)*100):0;const son=d.den[0];return(
          <Card key={o.id} tema={tema} style={{padding:'20px',display:'flex',alignItems:'center',gap:'20px'}}>
            <div style={{width:'50px',height:'50px',borderRadius:'50%',background:`${renkler[i%renkler.length]}20`,display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'16px',flexShrink:0}}>
              {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </div>
            <div style={{flex:1}}>
              <div style={{color:s.text,fontSize:'15px',fontWeight:'600'}}>{o.isim}</div>
              <div style={{color:s.text2,fontSize:'12px',marginTop:'2px'}}>{o.tur} · {o.email}</div>
              {o.veliEmail&&<div style={{color:s.text3,fontSize:'11px',marginTop:'2px'}}>Veli: {o.veliEmail}</div>}
            </div>
            <div style={{display:'flex',gap:'20px'}}>
              <div style={{textAlign:'center'}}><div style={{fontSize:'24px',fontWeight:'700',color:oran>=80?'#10B981':oran>=50?'#F59E0B':'#F43F5E'}}>{oran}%</div><div style={{fontSize:'11px',color:s.text3}}>Program</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'24px',fontWeight:'700',color:s.accent}}>{son?son.toplamNet:'—'}</div><div style={{fontSize:'11px',color:s.text3}}>Son Net</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'24px',fontWeight:'700',color:'#F59E0B'}}>{d.den.length}</div><div style={{fontSize:'11px',color:s.text3}}>Deneme</div></div>
            </div>
            {!o.veliEmail&&<div style={{background:'rgba(244,63,94,0.1)',color:'#F43F5E',padding:'6px 12px',borderRadius:'8px',fontSize:'11px',fontWeight:'600',border:'1px solid rgba(244,63,94,0.2)'}}>Veli yok</div>}
          </Card>
        );})}
      </div>}
    </div>
  );
}

// ===== ÇALIŞMA KARTİ =====
function CalismaKarti({tema, ogrenciId, beklenenSaat, gorevOrani, onKaydet}){
  const s=getS(tema);const bugun=new Date().toISOString().split('T')[0];
  const[saat,setSaat]=useState('');const[kaydedildi,setKaydedildi]=useState(false);const[yukleniyor,setYukleniyor]=useState(false);const[mevcutSaat,setMevcutSaat]=useState(null);
  useEffect(()=>{const getir=async()=>{try{const snap=await getDoc(doc(db,'ogrenciler',ogrenciId,'calisma',bugun));if(snap.exists()){setMevcutSaat(snap.data().saat);setSaat(String(snap.data().saat));setKaydedildi(true);}}catch(e){}};getir();},[]);
  const kaydet=async()=>{const ss=parseFloat(saat);if(!ss||ss<=0)return;setYukleniyor(true);try{const ver=verimlilikHesapla(ss,beklenenSaat,gorevOrani);await setDoc(doc(db,'ogrenciler',ogrenciId,'calisma',bugun),{saat:ss,tarih:bugun,verimlilik:ver,gorevOrani,beklenenSaat,olusturma:new Date()});setMevcutSaat(ss);setKaydedildi(true);if(onKaydet)onKaydet();}catch(e){alert(e.message);}setYukleniyor(false);};
  const ver=mevcutSaat!==null?verimlilikHesapla(mevcutSaat,beklenenSaat,gorevOrani):null;const durum=ver!==null?verimlilikDurum(ver):null;
  return(
    <Card tema={tema} style={{padding:'24px'}}>
      <div style={{fontWeight:'700',fontSize:'16px',color:s.text,marginBottom:'20px'}}>⏱️ Bugün Kaç Saat Çalıştım?</div>
      <div style={{display:'flex',gap:'12px',alignItems:'center',marginBottom:'20px'}}>
        <input type="number" min="0" max="16" step="0.5" value={saat} onChange={e=>setSaat(e.target.value)} placeholder="0" style={{width:'90px',background:s.surface2,border:`2px solid ${s.border}`,borderRadius:'12px',padding:'12px',color:s.text,fontSize:'24px',fontWeight:'700',outline:'none',textAlign:'center'}}/>
        <div style={{fontSize:'16px',color:s.text2}}>saat</div>
        <div style={{flex:1}}/>
        <div style={{fontSize:'13px',color:s.text3}}>Beklenen: <span style={{color:s.text2,fontWeight:'600'}}>{beklenenSaat}s</span></div>
        <Btn tema={tema} onClick={kaydet} disabled={!saat||yukleniyor}>{yukleniyor?'...':kaydedildi?'Güncelle':'Kaydet'}</Btn>
      </div>
      {durum&&(
        <div style={{background:s.surface2,borderRadius:'14px',padding:'16px 20px',display:'flex',alignItems:'center',gap:'16px',border:`1px solid ${durum.renk}30`}}>
          <div style={{fontSize:'36px'}}>{durum.emoji}</div>
          <div style={{flex:1}}><div style={{fontSize:'16px',fontWeight:'700',color:durum.renk}}>{durum.label}</div><div style={{fontSize:'12px',color:s.text3,marginTop:'2px'}}>{mevcutSaat}s çalışıldı · %{gorevOrani} görev tamamlandı</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:'36px',fontWeight:'800',color:durum.renk}}>{ver}%</div><div style={{fontSize:'12px',color:s.text3}}>verimlilik</div></div>
        </div>
      )}
      {durum&&<div style={{marginTop:'12px',height:'8px',background:s.surface3,borderRadius:'8px',overflow:'hidden'}}><div style={{height:'100%',width:ver+'%',background:durum.renk,borderRadius:'8px',transition:'width 0.5s'}}/></div>}
    </Card>
  );
}

// ===== DENEME MODAL =====
function DenemeModal({tema, ogrenciId, onKapat, onEkle}){
  const s=getS(tema);
  const[sinav,setSinav]=useState('TYT');const[tarih,setTarih]=useState(new Date().toISOString().split('T')[0]);const[veriler,setVeriler]=useState({});const[yukleniyor,setYukleniyor]=useState(false);
  const dersler=sinav==='TYT'?TYT_DERSLER:AYT_DERSLER;
  const guncelle=(dersId,tip,deger)=>setVeriler(prev=>({...prev,[dersId]:{...prev[dersId],[tip]:parseInt(deger)||0}}));
  const kaydet=async()=>{setYukleniyor(true);try{const netler={};let top=0;dersler.forEach(d=>{const dy=veriler[d.id]||{};const net=parseFloat(netHesapla(dy.d||0,dy.y||0));netler[d.id]={d:dy.d||0,y:dy.y||0,b:dy.b||0,net};top+=net;});await addDoc(collection(db,'ogrenciler',ogrenciId,'denemeler'),{sinav,tarih,netler,toplamNet:top.toFixed(2),olusturma:new Date()});onEkle();onKapat();}catch(e){alert(e.message);}setYukleniyor(false);};
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,overflowY:'auto',backdropFilter:'blur(4px)'}}>
      <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'20px',padding:'32px',width:'560px',margin:'20px',maxHeight:'90vh',overflowY:'auto',boxShadow:s.shadow}}>
        <div style={{color:s.text,fontSize:'18px',fontWeight:'700',marginBottom:'20px'}}>📊 Deneme Sonucu Gir</div>
        <div style={{display:'flex',gap:'10px',marginBottom:'16px'}}>
          {['TYT','AYT'].map(t=>(<div key={t} onClick={()=>{setSinav(t);setVeriler({});}} style={{flex:1,padding:'10px',borderRadius:'10px',border:sinav===t?`2px solid ${s.accent}`:`1px solid ${s.border}`,background:sinav===t?s.accentSoft:s.surface2,color:sinav===t?s.accent:s.text2,cursor:'pointer',textAlign:'center',fontSize:'14px',fontWeight:'600',transition:'all 0.15s'}}>{t}</div>))}
          <input type="date" value={tarih} onChange={e=>setTarih(e.target.value)} style={{flex:1,background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'10px 12px',color:s.text,fontSize:'13px',outline:'none'}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px 80px',gap:'6px',marginBottom:'20px'}}>
          <div style={{padding:'8px 10px',background:s.surface2,borderRadius:'8px',fontSize:'11px',color:s.text3,fontWeight:'600'}}>DERS</div>
          {['DOĞRU','YANLIŞ','BOŞ','NET'].map((h,i)=>(<div key={h} style={{padding:'8px',background:s.surface2,borderRadius:'8px',fontSize:'11px',fontWeight:'600',textAlign:'center',color:i===0?'#10B981':i===1?'#F43F5E':i===2?s.text3:s.accent}}>{h}</div>))}
          {dersler.map(ders=>{const dy=veriler[ders.id]||{};const net=netHesapla(dy.d||0,dy.y||0);return(<React.Fragment key={ders.id}>
            <div style={{padding:'8px 12px',background:s.surface2,borderRadius:'8px',fontSize:'13px',color:ders.renk,fontWeight:'500',display:'flex',alignItems:'center'}}>{ders.label}</div>
            <input type="number" min="0" max={ders.toplam} placeholder="0" value={dy.d||''} onChange={e=>guncelle(ders.id,'d',e.target.value)} style={{background:s.bg,border:'1px solid #10B981',borderRadius:'8px',padding:'8px',color:'#10B981',fontSize:'13px',outline:'none',textAlign:'center',width:'100%',boxSizing:'border-box'}}/>
            <input type="number" min="0" max={ders.toplam} placeholder="0" value={dy.y||''} onChange={e=>guncelle(ders.id,'y',e.target.value)} style={{background:s.bg,border:'1px solid #F43F5E',borderRadius:'8px',padding:'8px',color:'#F43F5E',fontSize:'13px',outline:'none',textAlign:'center',width:'100%',boxSizing:'border-box'}}/>
            <input type="number" min="0" max={ders.toplam} placeholder="0" value={dy.b||''} onChange={e=>guncelle(ders.id,'b',e.target.value)} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:'8px',padding:'8px',color:s.text2,fontSize:'13px',outline:'none',textAlign:'center',width:'100%',boxSizing:'border-box'}}/>
            <div style={{background:s.accentSoft,borderRadius:'8px',padding:'8px',fontSize:'15px',fontWeight:'700',color:s.accent,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>{net}</div>
          </React.Fragment>);})}
          <div style={{padding:'10px 12px',background:s.accentSoft,borderRadius:'8px',fontSize:'13px',fontWeight:'700',color:s.text,border:`1px solid ${s.accent}`,display:'flex',alignItems:'center'}}>TOPLAM NET</div>
          <div/><div/><div/>
          <div style={{padding:'10px',background:s.accentSoft,borderRadius:'8px',fontSize:'18px',fontWeight:'800',color:s.accent,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${s.accent}`}}>
            {dersler.reduce((acc,ders)=>{const dy=veriler[ders.id]||{};return acc+parseFloat(netHesapla(dy.d||0,dy.y||0));},0).toFixed(2)}
          </div>
        </div>
        <div style={{display:'flex',gap:'10px'}}>
          <Btn tema={tema} onClick={onKapat} variant="ghost" style={{flex:1}}>İptal</Btn>
          <Btn tema={tema} onClick={kaydet} disabled={yukleniyor} style={{flex:2}}>{yukleniyor?'Kaydediliyor...':'Kaydet →'}</Btn>
        </div>
      </div>
    </div>
  );
}

// ===== DENEME LİSTESİ =====
function DenemeListesi({tema, ogrenciId}){
  const s=getS(tema);
  const[denemeler,setDenemeler]=useState([]);const[modalAcik,setModalAcik]=useState(false);const[secili,setSecili]=useState(null);const[yukleniyor,setYukleniyor]=useState(true);
  const getir=async()=>{try{const snap=await getDocs(collection(db,'ogrenciler',ogrenciId,'denemeler'));const liste=snap.docs.map(d=>({id:d.id,...d.data()}));liste.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));setDenemeler(liste);}catch(e){}setYukleniyor(false);};
  useEffect(()=>{getir();},[]);
  return(
    <div>
      {modalAcik&&<DenemeModal tema={tema} ogrenciId={ogrenciId} onKapat={()=>setModalAcik(false)} onEkle={getir}/>}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
        <div style={{fontWeight:'700',fontSize:'16px',color:s.text}}>📊 Deneme Sonuçları</div>
        <Btn tema={tema} onClick={()=>setModalAcik(true)} style={{padding:'8px 16px',fontSize:'13px'}}>+ Deneme Ekle</Btn>
      </div>
      {yukleniyor?<div style={{textAlign:'center',padding:'20px',color:s.text3}}>Yükleniyor...</div>:
      denemeler.length===0?<Card tema={tema} style={{padding:'40px',textAlign:'center'}}><div style={{fontSize:'40px',marginBottom:'12px'}}>📊</div><div style={{color:s.text2}}>Henüz deneme yok</div></Card>:
      <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
        {denemeler.map(d=>(
          <Card key={d.id} tema={tema}>
            <div onClick={()=>setSecili(secili===d.id?null:d.id)} style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 20px',cursor:'pointer'}}>
              <div style={{background:s.accentSoft,color:s.accent,padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:'700'}}>{d.sinav}</div>
              <div style={{fontSize:'13px',color:s.text2}}>{d.tarih}</div>
              <div style={{marginLeft:'auto',fontSize:'22px',fontWeight:'800',color:s.accent}}>{d.toplamNet}</div>
              <div style={{fontSize:'12px',color:s.text3}}>net</div>
              <div style={{color:s.text3,fontSize:'12px'}}>{secili===d.id?'▲':'▼'}</div>
            </div>
            {secili===d.id&&(
              <div style={{padding:'16px 20px',borderTop:`1px solid ${s.border}`,display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'8px'}}>
                {Object.entries(d.netler||{}).map(([dersId,v])=>{const dl=[...TYT_DERSLER,...AYT_DERSLER].find(x=>x.id===dersId);return(
                  <div key={dersId} style={{background:s.surface2,borderRadius:'10px',padding:'12px 14px'}}>
                    <div style={{fontSize:'11px',color:s.text3,marginBottom:'4px'}}>{dl?.label||dersId}</div>
                    <div style={{fontSize:'18px',fontWeight:'700',color:dl?.renk||s.accent}}>{v.net}</div>
                    <div style={{fontSize:'10.5px',color:s.text3,marginTop:'2px'}}>{v.d}D · {v.y}Y · {v.b}B</div>
                  </div>
                );})}
              </div>
            )}
          </Card>
        ))}
      </div>}
    </div>
  );
}

// ===== HAFTALIK VERİMLİLİK =====
function HaftalikVerimlilik({tema, ogrenciId}){
  const s=getS(tema);
  const[veriler,setVeriler]=useState([]);
  const gunler=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
  useEffect(()=>{const getir=async()=>{try{const snap=await getDocs(collection(db,'ogrenciler',ogrenciId,'calisma'));setVeriler(snap.docs.map(d=>({tarih:d.id,...d.data()})));}catch(e){}};getir();},[]);
  const bugun=new Date();
  const haftaGunleri=Array.from({length:7},(_,i)=>{const d=new Date(bugun);d.setDate(bugun.getDate()-bugun.getDay()+i+1);return d.toISOString().split('T')[0];});
  return(
    <Card tema={tema} style={{padding:'20px'}}>
      <div style={{fontWeight:'700',fontSize:'15px',color:s.text,marginBottom:'16px'}}>📈 Bu Hafta Verimlilik</div>
      <div style={{display:'flex',gap:'8px'}}>
        {haftaGunleri.map((tarih,i)=>{const veri=veriler.find(v=>v.tarih===tarih);const durum=veri?verimlilikDurum(veri.verimlilik):null;return(
          <div key={tarih} style={{flex:1,textAlign:'center'}}>
            <div style={{fontSize:'10px',color:s.text3,marginBottom:'6px',fontWeight:'500'}}>{gunler[i]}</div>
            <div style={{height:'64px',borderRadius:'10px',background:durum?`${durum.renk}20`:s.surface2,border:`1px solid ${durum?durum.renk:s.border}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'2px',transition:'all 0.2s'}}>
              {durum?<><div style={{fontSize:'18px'}}>{durum.emoji}</div><div style={{fontSize:'11px',fontWeight:'700',color:durum.renk}}>{veri.verimlilik}%</div></>:<div style={{fontSize:'12px',color:s.text3}}>—</div>}
            </div>
            {veri&&<div style={{fontSize:'10px',color:s.text3,marginTop:'4px'}}>{veri.saat}s</div>}
          </div>
        );})}
      </div>
    </Card>
  );
}

// ===== KOÇ NOTLARI =====
function KocNotlari({tema, ogrenciId}){
  const s=getS(tema);
  const[notlar,setNotlar]=useState([]);const[yeniNot,setYeniNot]=useState('');const[yukleniyor,setYukleniyor]=useState(false);
  const getir=async()=>{try{const snap=await getDocs(collection(db,'ogrenciler',ogrenciId,'notlar'));const liste=snap.docs.map(d=>({id:d.id,...d.data()}));liste.sort((a,b)=>(b.olusturma?.seconds||0)-(a.olusturma?.seconds||0));setNotlar(liste);}catch(e){}};
  useEffect(()=>{getir();},[]);
  const kaydet=async()=>{if(!yeniNot.trim())return;setYukleniyor(true);try{await addDoc(collection(db,'ogrenciler',ogrenciId,'notlar'),{not:yeniNot,olusturma:new Date()});setYeniNot('');await getir();}catch(e){alert(e.message);}setYukleniyor(false);};
  return(
    <Card tema={tema} style={{padding:'20px'}}>
      <div style={{fontWeight:'700',fontSize:'15px',color:s.text,marginBottom:'16px'}}>📝 Koç Notları</div>
      <textarea value={yeniNot} onChange={e=>setYeniNot(e.target.value)} placeholder="Yeni not ekle..." style={{width:'100%',background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'10px',padding:'12px 14px',color:s.text,fontSize:'13px',outline:'none',resize:'vertical',minHeight:'80px',boxSizing:'border-box',fontFamily:'Inter,sans-serif',transition:'border 0.15s'}} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
      <Btn tema={tema} onClick={kaydet} disabled={!yeniNot.trim()||yukleniyor} style={{marginTop:'10px',width:'100%'}}>{yukleniyor?'Kaydediliyor...':'Not Ekle'}</Btn>
      {notlar.length>0&&<div style={{marginTop:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
        {notlar.map(n=>(
          <div key={n.id} style={{background:s.surface2,borderRadius:'10px',padding:'14px',borderLeft:`3px solid ${s.accent}`}}>
            <div style={{fontSize:'11px',color:s.text3,marginBottom:'6px'}}>{n.olusturma?.toDate?n.olusturma.toDate().toLocaleDateString('tr-TR'):''}</div>
            <div style={{fontSize:'13px',color:s.text,lineHeight:'1.6'}}>{n.not}</div>
          </div>
        ))}
      </div>}
    </Card>
  );
}

// ===== KOÇ NOTLARINI GÖRÜNTÜLE (öğrenci) =====
function KocNotlariOgrenci({tema, ogrenciId}){
  const s=getS(tema);
  const[notlar,setNotlar]=useState([]);
  useEffect(()=>{const getir=async()=>{try{const snap=await getDocs(collection(db,'ogrenciler',ogrenciId,'notlar'));const liste=snap.docs.map(d=>({id:d.id,...d.data()}));liste.sort((a,b)=>(b.olusturma?.seconds||0)-(a.olusturma?.seconds||0));setNotlar(liste);}catch(e){}};getir();},[]);
  return(
    <Card tema={tema} style={{padding:'20px'}}>
      <div style={{fontWeight:'700',fontSize:'15px',color:s.text,marginBottom:'16px'}}>📝 Koçumdan Notlar</div>
      {notlar.length===0?<div style={{textAlign:'center',padding:'20px',color:s.text3}}>Henüz not yok</div>:
      notlar.map(n=>(
        <div key={n.id} style={{background:s.surface2,borderRadius:'10px',padding:'14px',marginBottom:'10px',borderLeft:`3px solid ${s.accent}`}}>
          <div style={{fontSize:'11px',color:s.text3,marginBottom:'6px'}}>{n.olusturma?.toDate?n.olusturma.toDate().toLocaleDateString('tr-TR'):''}</div>
          <div style={{fontSize:'13px',color:s.text,lineHeight:'1.6'}}>{n.not}</div>
        </div>
      ))}
    </Card>
  );
}

// ===== OGRENCİ EKLE MODAL =====
function OgrenciEkleModal({tema, onKapat, onEkle}){
  const s=getS(tema);
  const[isim,setIsim]=useState('');const[email,setEmail]=useState('');const[sifre,setSifre]=useState('');
  const[veliEmail,setVeliEmail]=useState('');const[veliSifre,setVeliSifre]=useState('');
  const[tur,setTur]=useState('TYT');const[beklenenSaat,setBeklenenSaat]=useState(6);
  const[yukleniyor,setYukleniyor]=useState(false);const[hata,setHata]=useState('');
  const ekle=async()=>{
    if(!isim||!email||!sifre)return;if(sifre.length<6){setHata('Şifre en az 6 karakter!');return;}
    setYukleniyor(true);setHata('');
    try{const oS=await createUserWithEmailAndPassword(auth,email,sifre);const oUid=oS.user.uid;let vUid=null;
    if(veliEmail&&veliSifre&&veliSifre.length>=6){try{const vS=await createUserWithEmailAndPassword(auth,veliEmail,veliSifre);vUid=vS.user.uid;await setDoc(doc(db,'kullanicilar',vUid),{email:veliEmail,rol:'veli',ogrenciUid:oUid,ogrenciIsim:isim,olusturma:new Date()});}catch(e){if(e.code!=='auth/email-already-in-use')throw e;}}
    await setDoc(doc(db,'kullanicilar',oUid),{isim,email,tur,rol:'ogrenci',tamamlama:0,beklenenSaat,veliEmail:veliEmail||'',veliUid:vUid||'',olusturma:new Date()});
    await setDoc(doc(db,'ogrenciler',oUid),{isim,email,tur,tamamlama:0,beklenenSaat,veliEmail:veliEmail||'',olusturma:new Date()});
    onEkle();onKapat();}catch(e){if(e.code==='auth/email-already-in-use')setHata('Bu email zaten kullanımda!');else setHata('Hata: '+e.message);}
    setYukleniyor(false);
  };
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,overflowY:'auto',backdropFilter:'blur(4px)'}}>
      <div style={{background:s.surface,border:`1px solid ${s.border}`,borderRadius:'20px',padding:'36px',width:'440px',margin:'20px',boxShadow:s.shadow}}>
        <div style={{color:s.text,fontSize:'18px',fontWeight:'700',marginBottom:'24px'}}>👤 Yeni Öğrenci Ekle</div>
        <div style={{color:s.accent,fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'12px'}}>Öğrenci Bilgileri</div>
        {[{l:'Ad Soyad',v:isim,fn:setIsim,p:'Ad Soyad',t:'text'},{l:'Email',v:email,fn:setEmail,p:'email@ornek.com',t:'email'},{l:'Şifre',v:sifre,fn:setSifre,p:'En az 6 karakter',t:'password'}].map(f=>(
          <div key={f.l} style={{marginBottom:'12px'}}><div style={{color:s.text2,fontSize:'12px',marginBottom:'5px',fontWeight:'500'}}>{f.l}</div><Input tema={tema} type={f.t} value={f.v} onChange={e=>f.fn(e.target.value)} placeholder={f.p}/></div>
        ))}
        <div style={{marginBottom:'12px'}}>
          <div style={{color:s.text2,fontSize:'12px',marginBottom:'5px',fontWeight:'500'}}>Günlük Beklenen Çalışma</div>
          <div style={{display:'flex',gap:'6px'}}>
            {[4,5,6,7,8].map(n=>(<div key={n} onClick={()=>setBeklenenSaat(n)} style={{flex:1,padding:'9px',borderRadius:'9px',border:beklenenSaat===n?`2px solid ${s.accent}`:`1px solid ${s.border}`,background:beklenenSaat===n?s.accentSoft:s.surface2,color:beklenenSaat===n?s.accent:s.text2,cursor:'pointer',textAlign:'center',fontSize:'13px',fontWeight:'600',transition:'all 0.15s'}}>{n}s</div>))}
          </div>
        </div>
        <div style={{marginBottom:'16px'}}>
          <div style={{color:s.text2,fontSize:'12px',marginBottom:'5px',fontWeight:'500'}}>Sınav Türü</div>
          <div style={{display:'flex',gap:'8px'}}>
            {['TYT','TYT+AYT','LGS'].map(t=>(<div key={t} onClick={()=>setTur(t)} style={{flex:1,padding:'10px',borderRadius:'10px',border:tur===t?`2px solid ${s.accent}`:`1px solid ${s.border}`,background:tur===t?s.accentSoft:s.surface2,color:tur===t?s.accent:s.text2,cursor:'pointer',textAlign:'center',fontSize:'13px',fontWeight:'500',transition:'all 0.15s'}}>{t}</div>))}
          </div>
        </div>
        <div style={{borderTop:`1px solid ${s.border}`,paddingTop:'16px',marginBottom:'16px'}}>
          <div style={{color:'#10B981',fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'12px'}}>Veli (İsteğe Bağlı)</div>
          {[{l:'Veli Email',v:veliEmail,fn:setVeliEmail,p:'veli@email.com',t:'email'},{l:'Veli Şifre',v:veliSifre,fn:setVeliSifre,p:'En az 6 karakter',t:'password'}].map(f=>(
            <div key={f.l} style={{marginBottom:'10px'}}><div style={{color:s.text2,fontSize:'12px',marginBottom:'5px',fontWeight:'500'}}>{f.l}</div><Input tema={tema} type={f.t} value={f.v} onChange={e=>f.fn(e.target.value)} placeholder={f.p}/></div>
          ))}
        </div>
        {hata&&<div style={{color:'#F43F5E',fontSize:'13px',marginBottom:'14px',padding:'10px 14px',background:'rgba(244,63,94,0.1)',borderRadius:'8px'}}>{hata}</div>}
        <div style={{display:'flex',gap:'10px'}}>
          <Btn tema={tema} onClick={onKapat} variant="ghost" style={{flex:1}}>İptal</Btn>
          <Btn tema={tema} onClick={ekle} disabled={!isim||!email||!sifre||yukleniyor} style={{flex:2}}>{yukleniyor?'Ekleniyor...':'Ekle →'}</Btn>
        </div>
      </div>
    </div>
  );
}

// ===== VELİ PANELİ =====
function VeliPaneli({tema, kullanici, veliData, onCikis}){
  const s=getS(tema);
  const[ogrenciData,setOgrenciData]=useState(null);const[program,setProgram]=useState([]);const[denemeler,setDenemeler]=useState([]);const[yukleniyor,setYukleniyor]=useState(true);
  useEffect(()=>{const getir=async()=>{try{if(veliData?.ogrenciUid){const os=await getDoc(doc(db,'kullanicilar',veliData.ogrenciUid));if(os.exists())setOgrenciData(os.data());const ps=await getDocs(collection(db,'ogrenciler',veliData.ogrenciUid,'program'));setProgram(ps.docs.map(d=>({id:d.id,...d.data()})));const ds=await getDocs(collection(db,'ogrenciler',veliData.ogrenciUid,'denemeler'));const dl=ds.docs.map(d=>({id:d.id,...d.data()}));dl.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));setDenemeler(dl);}}catch(e){}setYukleniyor(false);};getir();},[]);
  const tam=program.filter(p=>p.tamamlandi).length;const oran=program.length>0?Math.round((tam/program.length)*100):0;
  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'Inter,sans-serif'}}>
      <TopBar tema={tema} kullanici={kullanici} rol="veli" onCikis={onCikis} title="Veli Paneli"/>
      <div style={{padding:'28px',maxWidth:'900px',margin:'0 auto'}}>
        {yukleniyor?<div style={{textAlign:'center',padding:'60px',color:s.text3}}>Yükleniyor...</div>:!ogrenciData?<div style={{textAlign:'center',padding:'60px',color:s.text2}}>Bilgi bulunamadı.</div>:(
          <>
            <div style={{background:s.accentGrad,borderRadius:'20px',padding:'28px 32px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'24px',boxShadow:'0 8px 32px rgba(91,79,232,0.3)'}}>
              <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'800',fontSize:'22px',backdropFilter:'blur(8px)'}}>
                {ogrenciData.isim?.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div style={{flex:1}}><div style={{fontSize:'22px',fontWeight:'700',color:'white'}}>{ogrenciData.isim}</div><div style={{fontSize:'13px',color:'rgba(255,255,255,0.8)',marginTop:'4px'}}>{ogrenciData.tur} · {ogrenciData.email}</div></div>
              <div style={{display:'flex',gap:'20px'}}>
                <div style={{textAlign:'center',background:'rgba(255,255,255,0.15)',borderRadius:'14px',padding:'14px 20px',backdropFilter:'blur(8px)'}}>
                  <div style={{fontSize:'28px',fontWeight:'800',color:'white'}}>{oran}%</div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.8)'}}>Görev</div>
                </div>
                {denemeler[0]&&<div style={{textAlign:'center',background:'rgba(255,255,255,0.15)',borderRadius:'14px',padding:'14px 20px',backdropFilter:'blur(8px)'}}>
                  <div style={{fontSize:'28px',fontWeight:'800',color:'white'}}>{denemeler[0].toplamNet}</div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.8)'}}>Son Net</div>
                </div>}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'14px',marginBottom:'24px'}}>
              <StatCard tema={tema} label="Toplam Görev" value={program.length} sub="Bu hafta" renk="#5B4FE8" icon="📋"/>
              <StatCard tema={tema} label="Tamamlanan" value={tam} sub="Görev" renk="#10B981" icon="✅"/>
              <StatCard tema={tema} label="Deneme Sayısı" value={denemeler.length} sub="Toplam" renk="#F59E0B" icon="📊"/>
            </div>
            <Card tema={tema}>
              <div style={{padding:'16px 20px',borderBottom:`1px solid ${s.border}`}}><div style={{color:s.text,fontWeight:'600'}}>📅 Haftalık Program</div></div>
              <div style={{padding:'16px 20px'}}>
                {program.length===0?<div style={{textAlign:'center',padding:'20px',color:s.text3}}>Program henüz eklenmemiş</div>:
                program.map(p=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom:`1px solid ${s.border}`}}>
                    <div style={{width:'20px',height:'20px',borderRadius:'6px',background:p.tamamlandi?'#10B981':s.surface2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',color:'white',flexShrink:0}}>{p.tamamlandi&&'✓'}</div>
                    <div style={{flex:1}}><div style={{fontSize:'13px',color:p.tamamlandi?s.text3:s.text,textDecoration:p.tamamlandi?'line-through':'none'}}>{p.gorev}</div><div style={{fontSize:'11px',color:s.text3}}>{p.ders}</div></div>
                    <div style={{fontSize:'11px',fontWeight:'600',color:p.tamamlandi?'#10B981':'#F59E0B'}}>{p.tamamlandi?'✓ Tamamlandı':'Bekliyor'}</div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// ===== OGRENCİ PANELİ =====
function OgrenciPaneli({tema, kullanici, ogrenciData, onCikis}){
  const s=getS(tema);
  const[program,setProgram]=useState([]);const[denemeler,setDenemeler]=useState([]);const[yukleniyor,setYukleniyor]=useState(true);const[aktifSekme,setAktifSekme]=useState('program');
  const getir=async()=>{try{const ps=await getDocs(collection(db,'ogrenciler',kullanici.uid,'program'));setProgram(ps.docs.map(d=>({id:d.id,...d.data()})));const ds=await getDocs(collection(db,'ogrenciler',kullanici.uid,'denemeler'));const dl=ds.docs.map(d=>({id:d.id,...d.data()}));dl.sort((a,b)=>new Date(b.tarih)-new Date(a.tarih));setDenemeler(dl);}catch(e){}setYukleniyor(false);};
  useEffect(()=>{getir();},[]);
  const gorevTamamla=async(id,mevcut)=>{try{await updateDoc(doc(db,'ogrenciler',kullanici.uid,'program',id),{tamamlandi:!mevcut});await getir();}catch(e){}};
  const tam=program.filter(p=>p.tamamlandi).length;const oran=program.length>0?Math.round((tam/program.length)*100):0;const beklenenSaat=ogrenciData?.beklenenSaat||6;
  const sekmeler=[{key:'program',label:'📅 Program'},{key:'denemeler',label:'📊 Denemeler'},{key:'calisma',label:'⏱️ Çalışma'},{key:'mesajlar',label:'💬 Mesajlar'},{key:'notlar',label:'📝 Notlar'}];
  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'Inter,sans-serif'}}>
      <TopBar tema={tema} kullanici={kullanici} rol="ogrenci" onCikis={onCikis}/>
      <div style={{maxWidth:'1000px',margin:'0 auto',padding:'24px'}}>
        <div style={{background:s.accentGrad,borderRadius:'20px',padding:'24px 28px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'20px',boxShadow:'0 8px 32px rgba(91,79,232,0.25)'}}>
          <div style={{flex:1}}>
            <div style={{fontSize:'22px',fontWeight:'700',color:'white'}}>Hoş geldin, {ogrenciData?.isim?.split(' ')[0]||'Öğrenci'} 👋</div>
            <div style={{fontSize:'13px',color:'rgba(255,255,255,0.8)',marginTop:'4px'}}>{ogrenciData?.tur} · Elsway Koçluk Platformu</div>
          </div>
          <div style={{display:'flex',gap:'12px'}}>
            {[{v:oran+'%',l:'Tamamlama'},{v:`${tam}/${program.length}`,l:'Görev'},{v:denemeler[0]?denemeler[0].toplamNet:'—',l:denemeler[0]?`Son ${denemeler[0].sinav}`:'Deneme'}].map((item,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.15)',borderRadius:'12px',padding:'12px 18px',textAlign:'center',backdropFilter:'blur(8px)'}}>
                <div style={{fontSize:'22px',fontWeight:'800',color:'white'}}>{item.v}</div>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,0.75)'}}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:'6px',marginBottom:'20px',background:s.surface2,padding:'4px',borderRadius:'12px',width:'fit-content'}}>
          {sekmeler.map(sek=>(
            <div key={sek.key} onClick={()=>setAktifSekme(sek.key)} style={{padding:'8px 16px',borderRadius:'9px',background:aktifSekme===sek.key?s.surface:'transparent',color:aktifSekme===sek.key?s.accent:s.text2,cursor:'pointer',fontSize:'13px',fontWeight:aktifSekme===sek.key?'600':'400',transition:'all 0.15s',boxShadow:aktifSekme===sek.key?s.shadow:'none'}}>{sek.label}</div>
          ))}
        </div>
        {aktifSekme==='program'&&(
          <Card tema={tema}>
            <div style={{padding:'16px 20px',borderBottom:`1px solid ${s.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:s.text}}>📅 Günlük Programım</div>
              <div style={{fontSize:'13px',color:s.text2}}>{tam}/{program.length} tamamlandı · <span style={{color:oran>=80?'#10B981':oran>=50?'#F59E0B':'#F43F5E',fontWeight:'600'}}>{oran}%</span></div>
            </div>
            <div style={{padding:'16px 20px'}}>
              {yukleniyor?<div style={{textAlign:'center',padding:'20px',color:s.text3}}>Yükleniyor...</div>:
              program.length===0?<div style={{textAlign:'center',padding:'40px'}}><div style={{fontSize:'40px',marginBottom:'12px'}}>📋</div><div style={{color:s.text2}}>Koçun henüz program eklemedi</div></div>:
              program.map(p=>(
                <div key={p.id} onClick={()=>gorevTamamla(p.id,p.tamamlandi)} style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',borderRadius:'10px',cursor:'pointer',marginBottom:'4px',transition:'background 0.15s',background:p.tamamlandi?`${s.surface2}80`:'transparent'}} onMouseEnter={e=>e.currentTarget.style.background=s.surface2} onMouseLeave={e=>e.currentTarget.style.background=p.tamamlandi?`${s.surface2}80`:'transparent'}>
                  <div style={{width:'24px',height:'24px',borderRadius:'7px',border:p.tamamlandi?'none':`2px solid ${s.border}`,background:p.tamamlandi?'#10B981':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',flexShrink:0,color:'white',transition:'all 0.15s'}}>{p.tamamlandi&&'✓'}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'14px',color:p.tamamlandi?s.text3:s.text,textDecoration:p.tamamlandi?'line-through':'none',fontWeight:'500'}}>{p.gorev}</div>
                    <div style={{fontSize:'12px',color:s.text3,marginTop:'2px'}}>{p.ders}</div>
                  </div>
                  <div style={{fontSize:'12px',color:p.tamamlandi?'#10B981':s.text3,fontWeight:'500'}}>{p.tamamlandi?'✓ Tamamlandı':'Tamamla →'}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
        {aktifSekme==='denemeler'&&<DenemeListesi tema={tema} ogrenciId={kullanici.uid}/>}
        {aktifSekme==='calisma'&&<CalismaKarti tema={tema} ogrenciId={kullanici.uid} beklenenSaat={beklenenSaat} gorevOrani={oran} onKaydet={getir}/>}
        {aktifSekme==='mesajlar'&&<MesajEkrani tema={tema} ogrenciId={kullanici.uid} gonderen="ogrenci"/>}
        {aktifSekme==='notlar'&&<KocNotlariOgrenci tema={tema} ogrenciId={kullanici.uid}/>}
      </div>
    </div>
  );
}

// ===== OGRENCİ DETAY (KOÇ) =====
function OgrenciDetay({tema, ogrenci, onGeri}){
  const s=getS(tema);
  const[program,setProgram]=useState([]);const[yeniGorev,setYeniGorev]=useState('');const[yeniDers,setYeniDers]=useState('Matematik');const[yukleniyor,setYukleniyor]=useState(false);const[aktifSekme,setAktifSekme]=useState('program');
  const dersler=['Matematik','Türkçe','Fizik','Kimya','Biyoloji','Tarih','Coğrafya','Edebiyat'];
  const programiGetir=async()=>{try{const snap=await getDocs(collection(db,'ogrenciler',ogrenci.id,'program'));setProgram(snap.docs.map(d=>({id:d.id,...d.data()})));}catch(e){}};
  useEffect(()=>{programiGetir();},[]);
  const gorevEkle=async()=>{if(!yeniGorev)return;setYukleniyor(true);try{await addDoc(collection(db,'ogrenciler',ogrenci.id,'program'),{gorev:yeniGorev,ders:yeniDers,tamamlandi:false,tarih:new Date()});setYeniGorev('');await programiGetir();}catch(e){alert(e.message);}setYukleniyor(false);};
  const tam=program.filter(p=>p.tamamlandi).length;const oran=program.length>0?Math.round((tam/program.length)*100):0;
  const sekmeler=[{key:'program',label:'📅 Program'},{key:'denemeler',label:'📊 Denemeler'},{key:'verimlilik',label:'📈 Verimlilik'},{key:'mesajlar',label:'💬 Mesajlar'}];
  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'Inter,sans-serif'}}>
      <div style={{background:s.surface,borderBottom:`1px solid ${s.border}`,padding:'0 28px',height:'64px',display:'flex',alignItems:'center',gap:'14px',position:'sticky',top:0,zIndex:100,boxShadow:s.shadow}}>
        <Btn tema={tema} onClick={onGeri} variant="outline" style={{padding:'8px 16px'}}>← Geri</Btn>
        <div style={{fontWeight:'700',fontSize:'17px',color:s.text}}>{ogrenci.isim}</div>
        <div style={{background:s.accentSoft,color:s.accent,padding:'4px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:'600'}}>{ogrenci.tur}</div>
        <div style={{display:'flex',gap:'4px',marginLeft:'12px',background:s.surface2,padding:'4px',borderRadius:'10px'}}>
          {sekmeler.map(sek=>(<div key={sek.key} onClick={()=>setAktifSekme(sek.key)} style={{padding:'7px 14px',borderRadius:'8px',background:aktifSekme===sek.key?s.surface:'transparent',color:aktifSekme===sek.key?s.accent:s.text2,cursor:'pointer',fontSize:'12px',fontWeight:'500',transition:'all 0.15s'}}>{sek.label}</div>))}
        </div>
        <div style={{marginLeft:'auto',fontSize:'13px',color:s.text2}}>{ogrenci.email}</div>
      </div>
      <div style={{padding:'24px'}}>
        {aktifSekme==='program'&&(
          <div style={{display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:'20px'}}>
            <Card tema={tema}>
              <div style={{padding:'16px 20px',borderBottom:`1px solid ${s.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{fontWeight:'700',fontSize:'15px',color:s.text}}>📅 Haftalık Program</div>
                <div style={{fontSize:'13px',color:s.text2}}>{tam}/{program.length} · <span style={{color:oran>=80?'#10B981':oran>=50?'#F59E0B':'#F43F5E',fontWeight:'600'}}>{oran}%</span></div>
              </div>
              <div style={{padding:'16px 20px'}}>
                <div style={{display:'flex',gap:'8px',marginBottom:'16px',flexWrap:'wrap'}}>
                  <select value={yeniDers} onChange={e=>setYeniDers(e.target.value)} style={{background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'9px',padding:'9px 12px',color:s.text,fontSize:'13px',outline:'none'}}>
                    {dersler.map(d=><option key={d}>{d}</option>)}
                  </select>
                  <input value={yeniGorev} onChange={e=>setYeniGorev(e.target.value)} onKeyDown={e=>e.key==='Enter'&&gorevEkle()} placeholder="Görev yaz... (Enter)" style={{flex:1,background:s.surface2,border:`1px solid ${s.border}`,borderRadius:'9px',padding:'9px 12px',color:s.text,fontSize:'13px',outline:'none',minWidth:'120px'}}/>
                  <Btn tema={tema} onClick={gorevEkle} disabled={!yeniGorev||yukleniyor} style={{padding:'9px 16px',fontSize:'13px'}}>+ Ekle</Btn>
                </div>
                {program.length===0?<div style={{textAlign:'center',padding:'20px',color:s.text3}}>Henüz görev eklenmedi</div>:
                program.map(p=>(
                  <div key={p.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px',borderRadius:'8px',marginBottom:'4px',background:p.tamamlandi?s.surface2:'transparent'}}>
                    <div style={{width:'20px',height:'20px',borderRadius:'6px',background:p.tamamlandi?'#10B981':s.surface2,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',color:'white',flexShrink:0}}>{p.tamamlandi&&'✓'}</div>
                    <div style={{flex:1}}><div style={{fontSize:'13px',color:p.tamamlandi?s.text3:s.text,textDecoration:p.tamamlandi?'line-through':'none'}}>{p.gorev}</div><div style={{fontSize:'11px',color:s.text3}}>{p.ders}</div></div>
                    <div style={{fontSize:'11px',color:p.tamamlandi?'#10B981':s.text3,fontWeight:'500'}}>{p.tamamlandi?'✓':'Bekliyor'}</div>
                  </div>
                ))}
              </div>
            </Card>
            <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
              <Card tema={tema} style={{padding:'20px'}}>
                <div style={{fontWeight:'700',fontSize:'15px',color:s.text,marginBottom:'14px'}}>👤 Bilgiler</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
                  {[{l:'SINAV TÜRÜ',v:ogrenci.tur,c:s.accent},{l:'TAMAMLAMA',v:'%'+oran,c:'#10B981'},{l:'BEKLENEN',v:(ogrenci.beklenenSaat||6)+'s/gün',c:'#F59E0B'}].map(k=>(
                    <div key={k.l} style={{background:s.surface2,borderRadius:'10px',padding:'12px 14px'}}>
                      <div style={{fontSize:'10px',color:s.text3,marginBottom:'4px',fontWeight:'600',letterSpacing:'0.5px'}}>{k.l}</div>
                      <div style={{fontSize:'16px',fontWeight:'700',color:k.c}}>{k.v}</div>
                    </div>
                  ))}
                </div>
                {ogrenci.veliEmail&&<div style={{background:s.surface2,borderRadius:'10px',padding:'12px 14px',marginBottom:'10px'}}><div style={{fontSize:'10px',color:s.text3,marginBottom:'4px',fontWeight:'600'}}>VELİ</div><div style={{fontSize:'13px',color:s.text2}}>{ogrenci.veliEmail}</div></div>}
                <Btn tema={tema} onClick={async()=>{if(window.confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')){try{await deleteDoc(doc(db,'ogrenciler',ogrenci.id));onGeri();}catch(e){alert(e.message);}}}} variant="danger" style={{width:'100%'}}>🗑️ Öğrenciyi Sil</Btn>
              </Card>
              <KocNotlari tema={tema} ogrenciId={ogrenci.id}/>
            </div>
          </div>
        )}
        {aktifSekme==='denemeler'&&<div style={{maxWidth:'700px'}}><DenemeListesi tema={tema} ogrenciId={ogrenci.id}/></div>}
        {aktifSekme==='verimlilik'&&<div style={{maxWidth:'700px'}}><HaftalikVerimlilik tema={tema} ogrenciId={ogrenci.id}/></div>}
        {aktifSekme==='mesajlar'&&<div style={{maxWidth:'700px'}}><MesajEkrani tema={tema} ogrenciId={ogrenci.id} gonderen="koc"/></div>}
      </div>
    </div>
  );
}

// ===== KOÇ PANELİ =====
function KocPaneli({tema, kullanici, onCikis}){
  const s=getS(tema);
  const[ogrenciler,setOgrenciler]=useState([]);const[modalAcik,setModalAcik]=useState(false);const[seciliOgrenci,setSeciliOgrenci]=useState(null);const[aktifSayfa,setAktifSayfa]=useState('ana');const[yukleniyor,setYukleniyor]=useState(true);const[okunmamisMesaj,setOkunmamisMesaj]=useState(0);
  const ogrencileriGetir=async()=>{setYukleniyor(true);try{const snap=await getDocs(collection(db,'ogrenciler'));setOgrenciler(snap.docs.map(d=>({id:d.id,...d.data()})));}catch(e){}setYukleniyor(false);};
  const mesajSayisiGetir=async(list)=>{let toplam=0;const bugun=new Date();bugun.setHours(0,0,0,0);for(const o of list){try{const snap=await getDocs(collection(db,'ogrenciler',o.id,'mesajlar'));toplam+=snap.docs.filter(d=>{const m=d.data();if(m.gonderen!=='ogrenci')return false;const t=m.olusturma?.toDate?m.olusturma.toDate():new Date(0);return t>=bugun;}).length;}catch(e){}}setOkunmamisMesaj(toplam);};
  useEffect(()=>{ogrencileriGetir();},[]);
  useEffect(()=>{if(ogrenciler.length>0)mesajSayisiGetir(ogrenciler);},[ogrenciler]);
  const ortTamamlama=ogrenciler.length>0?Math.round(ogrenciler.reduce((acc,o)=>acc+(o.tamamlama||0),0)/ogrenciler.length):0;
  if(seciliOgrenci)return<OgrenciDetay tema={tema} ogrenci={seciliOgrenci} onGeri={()=>setSeciliOgrenci(null)}/>;
  if(aktifSayfa==='mesajlar')return<div style={{minHeight:'100vh',background:s.bg,fontFamily:'Inter,sans-serif'}}><TopBar tema={tema} kullanici={kullanici} rol="koc" onCikis={onCikis} title="Mesajlar"/><KocMesajlarSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/></div>;
  if(aktifSayfa==='haftalikprogram')return<div style={{minHeight:'100vh',background:s.bg,fontFamily:'Inter,sans-serif'}}><TopBar tema={tema} kullanici={kullanici} rol="koc" onCikis={onCikis}/><HaftalikProgramSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/></div>;
  if(aktifSayfa==='gunluktakip')return<div style={{minHeight:'100vh',background:s.bg,fontFamily:'Inter,sans-serif'}}><TopBar tema={tema} kullanici={kullanici} rol="koc" onCikis={onCikis}/><GunlukTakipSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/></div>;
  if(aktifSayfa==='denemeyonetimi')return<div style={{minHeight:'100vh',background:s.bg,fontFamily:'Inter,sans-serif'}}><TopBar tema={tema} kullanici={kullanici} rol="koc" onCikis={onCikis}/><DenemeYonetimiSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/></div>;
  if(aktifSayfa==='istatistikler')return<div style={{minHeight:'100vh',background:s.bg,fontFamily:'Inter,sans-serif'}}><TopBar tema={tema} kullanici={kullanici} rol="koc" onCikis={onCikis}/><IstatistiklerSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/></div>;
  if(aktifSayfa==='hedeftakibi')return<div style={{minHeight:'100vh',background:s.bg,fontFamily:'Inter,sans-serif'}}><TopBar tema={tema} kullanici={kullanici} rol="koc" onCikis={onCikis}/><HedefTakibiSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/></div>;
  if(aktifSayfa==='veliraporlari')return<div style={{minHeight:'100vh',background:s.bg,fontFamily:'Inter,sans-serif'}}><TopBar tema={tema} kullanici={kullanici} rol="koc" onCikis={onCikis}/><VeliRaporlariSayfasi tema={tema} ogrenciler={ogrenciler} onGeri={()=>setAktifSayfa('ana')}/></div>;
  if(aktifSayfa==='ogrenciler')return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'Inter,sans-serif'}}>
      <TopBar tema={tema} kullanici={kullanici} rol="koc" onCikis={onCikis} title="Öğrencilerim"/>
      {modalAcik&&<OgrenciEkleModal tema={tema} onKapat={()=>setModalAcik(false)} onEkle={()=>{signOut(auth).then(()=>window.location.reload());}}/>}
      <div style={{padding:'28px'}}>
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'20px'}}>
          <Btn tema={tema} onClick={()=>setModalAcik(true)}>+ Öğrenci Ekle</Btn>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {ogrenciler.map((o,i)=>(
            <Card key={o.id} tema={tema} style={{padding:'16px 20px',cursor:'pointer',transition:'transform 0.15s'}} onClick={()=>setSeciliOgrenci(o)}>
              <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                <div style={{width:'44px',height:'44px',borderRadius:'50%',background:`${renkler[i%renkler.length]}20`,display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'800',fontSize:'15px'}}>
                  {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div style={{flex:1}}>
                  <div style={{color:s.text,fontSize:'14px',fontWeight:'600'}}>{o.isim}</div>
                  <div style={{color:s.text2,fontSize:'12px',marginTop:'2px'}}>{o.tur} · {o.email}</div>
                </div>
                <div style={{color:s.accent,fontSize:'18px'}}>→</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const menu=[
    {key:'ana',icon:'🏠',label:'Genel Bakış'},
    {key:'ogrenciler',icon:'👥',label:'Öğrencilerim'},
    {key:'haftalikprogram',icon:'📅',label:'Haftalık Program'},
    {key:'gunluktakip',icon:'✅',label:'Günlük Takip'},
    {key:'denemeyonetimi',icon:'📊',label:'Deneme Yönetimi'},
    {key:'istatistikler',icon:'📈',label:'İstatistikler'},
    {key:'hedeftakibi',icon:'🎯',label:'Hedef Takibi'},
    {key:'mesajlar',icon:'💬',label:'Mesajlar',badge:okunmamisMesaj},
    {key:'veliraporlari',icon:'📋',label:'Veli Raporları'},
  ];

  return(
    <div style={{minHeight:'100vh',background:s.bg,fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column'}}>
      <TopBar tema={tema} kullanici={kullanici} rol="koc" onCikis={onCikis}/>
      {modalAcik&&<OgrenciEkleModal tema={tema} onKapat={()=>setModalAcik(false)} onEkle={()=>{signOut(auth).then(()=>window.location.reload());}}/>}
      <div style={{display:'flex',flex:1}}>
        <SideNav tema={tema} menu={menu} aktif={aktifSayfa} onSelect={item=>setAktifSayfa(item.key)}/>
        <div style={{flex:1,padding:'32px',overflowY:'auto'}}>
          <div style={{marginBottom:'28px'}}>
            <h1 style={{fontSize:'26px',fontWeight:'700',color:s.text}}>Hoş geldin, <span style={{background:s.accentGrad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Koç</span> 👋</h1>
            <div style={{color:s.text2,fontSize:'14px',marginTop:'4px'}}>Elsway · YKS / LGS Koçluk Platformu</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',marginBottom:'28px'}}>
            <StatCard tema={tema} label="Aktif Öğrenci" value={ogrenciler.length} sub="Toplam" renk="#5B4FE8" icon="👥"/>
            <StatCard tema={tema} label="Ort. Tamamlama" value={'%'+ortTamamlama} sub="Tüm öğrenciler" renk="#10B981" icon="✅"/>
            <StatCard tema={tema} label="Yeni Mesaj" value={okunmamisMesaj} sub="Bugün gelen" renk="#F43F5E" icon="💬"/>
            <StatCard tema={tema} label="Toplam Öğrenci" value={ogrenciler.length} sub="Kayıtlı" renk="#F59E0B" icon="🎓"/>
          </div>
          <Card tema={tema}>
            <div style={{padding:'16px 20px',borderBottom:`1px solid ${s.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{color:s.text,fontWeight:'600',fontSize:'15px'}}>👥 Öğrencilerim</div>
              <Btn tema={tema} onClick={()=>setModalAcik(true)} style={{padding:'8px 16px',fontSize:'13px'}}>+ Yeni Ekle</Btn>
            </div>
            {yukleniyor?<div style={{padding:'30px',textAlign:'center',color:s.text3}}>Yükleniyor...</div>:
            ogrenciler.length===0?<div style={{padding:'50px',textAlign:'center'}}><div style={{fontSize:'48px',marginBottom:'16px'}}>👥</div><div style={{color:s.text2,fontSize:'15px'}}>Henüz öğrenci yok</div><div style={{color:s.text3,fontSize:'13px',marginTop:'8px'}}>+ Yeni Ekle butonuna bas</div></div>:
            ogrenciler.map((o,i)=>(
              <div key={o.id} onClick={()=>setSeciliOgrenci(o)} style={{display:'flex',alignItems:'center',gap:'14px',padding:'16px 20px',borderBottom:`1px solid ${s.border}`,cursor:'pointer',transition:'background 0.15s'}} onMouseEnter={e=>e.currentTarget.style.background=s.surface2} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{width:'40px',height:'40px',borderRadius:'50%',background:`${renkler[i%renkler.length]}20`,display:'flex',alignItems:'center',justifyContent:'center',color:renkler[i%renkler.length],fontWeight:'700',fontSize:'13px',flexShrink:0}}>
                  {o.isim.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div style={{flex:1}}>
                  <div style={{color:s.text,fontSize:'14px',fontWeight:'500'}}>{o.isim}</div>
                  <div style={{color:s.text2,fontSize:'12px',marginTop:'2px'}}>{o.tur} · {o.email}</div>
                </div>
                <div style={{color:s.accent,fontSize:'16px',fontWeight:'300'}}>→</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ===== GİRİŞ EKRANI =====
function GirisEkrani({tema, onGiris}){
  const s=getS(tema);
  const[email,setEmail]=useState('');const[sifre,setSifre]=useState('');const[hata,setHata]=useState('');const[yukleniyor,setYukleniyor]=useState(false);
  const girisYap=async()=>{setYukleniyor(true);setHata('');try{const sonuc=await signInWithEmailAndPassword(auth,email,sifre);const kd=await getDoc(doc(db,'kullanicilar',sonuc.user.uid));let rol='koc';let data=null;if(kd.exists()){rol=kd.data().rol||'ogrenci';data=kd.data();}onGiris(sonuc.user,rol,data);}catch(e){setHata('Email veya şifre hatalı!');}setYukleniyor(false);};
  return(
    <div style={{minHeight:'100vh',display:'flex',fontFamily:'Inter,sans-serif',background:s.bg}}>
      {/* SOL */}
      <div style={{flex:1,background:s.accentGrad,display:'flex',flexDirection:'column',justifyContent:'center',padding:'80px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-100px',right:'-100px',width:'400px',height:'400px',background:'rgba(255,255,255,0.05)',borderRadius:'50%'}}/>
        <div style={{position:'absolute',bottom:'-80px',left:'-80px',width:'300px',height:'300px',background:'rgba(255,255,255,0.05)',borderRadius:'50%'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <h1 style={{fontSize:'56px',fontWeight:'800',color:'white',marginBottom:'12px',letterSpacing:'-1px'}}>Elsway</h1>
          <p style={{fontSize:'20px',color:'rgba(255,255,255,0.9)',lineHeight:'1.6'}}>Kendi yolunu oluştur.<br/>Planla. Uygula. Kazan.</p>
          <div style={{marginTop:'48px',display:'flex',flexDirection:'column',gap:'16px'}}>
            {['Akıllı program takibi','Deneme analizi ve net hesaplama','Koç-öğrenci-veli iletişimi','Verimlilik skoru ve raporlama'].map(f=>(
              <div key={f} style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{width:'24px',height:'24px',background:'rgba(255,255,255,0.2)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',color:'white',flexShrink:0}}>✓</div>
                <div style={{color:'rgba(255,255,255,0.9)',fontSize:'15px'}}>{f}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* SAĞ */}
      <div style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center',padding:'40px'}}>
        <div style={{width:'400px',background:s.surface,borderRadius:'24px',padding:'44px',boxShadow:s.shadow}}>
          <div style={{textAlign:'center',marginBottom:'32px'}}>
            <div style={{fontSize:'32px',fontWeight:'800',background:s.accentGrad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Els<span>way</span></div>
            <div style={{fontSize:'13px',color:s.text3,marginTop:'6px'}}>YKS / LGS Koçluk & Danışmanlık</div>
          </div>
          <div style={{marginBottom:'16px'}}>
            <div style={{color:s.text2,fontSize:'13px',marginBottom:'7px',fontWeight:'500'}}>Email</div>
            <Input tema={tema} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@ornek.com"/>
          </div>
          <div style={{marginBottom:'24px'}}>
            <div style={{color:s.text2,fontSize:'13px',marginBottom:'7px',fontWeight:'500'}}>Şifre</div>
            <Input tema={tema} type="password" value={sifre} onChange={e=>setSifre(e.target.value)} placeholder="••••••••"/>
          </div>
          {hata&&<div style={{color:'#F43F5E',fontSize:'13px',marginBottom:'16px',padding:'10px 14px',background:'rgba(244,63,94,0.1)',borderRadius:'10px',border:'1px solid rgba(244,63,94,0.2)'}}>{hata}</div>}
          <Btn tema={tema} onClick={girisYap} disabled={yukleniyor||!email||!sifre} style={{width:'100%',padding:'14px',fontSize:'15px'}}>
            {yukleniyor?'Giriş yapılıyor...':'Giriş Yap →'}
          </Btn>
          <div style={{textAlign:'center',marginTop:'20px',fontSize:'12px',color:s.text3}}>
            {tema==='dark'?'🌙 Gece modu':'☀️ Gündüz modu'} · Otomatik değişir
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== ANA APP =====
function App(){
  const tema=useTheme();
  const[kullanici,setKullanici]=useState(null);
  const[rol,setRol]=useState('');
  const[userData,setUserData]=useState(null);
  const[yukleniyor,setYukleniyor]=useState(true);

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async(user)=>{
      if(user){
        try{
          const kd=await getDoc(doc(db,'kullanicilar',user.uid));
          let r='koc';let d=null;
          if(kd.exists()){r=kd.data().rol||'ogrenci';d=kd.data();}
          setKullanici(user);setRol(r);setUserData(d);
        }catch(e){setKullanici(user);setRol('koc');}
      }else{setKullanici(null);setRol('');setUserData(null);}
      setYukleniyor(false);
    });
    return()=>unsub();
  },[]);

  const girisYap=(u,r,d)=>{setKullanici(u);setRol(r);setUserData(d);};
  const cikisYap=async()=>{await signOut(auth);setKullanici(null);setRol('');setUserData(null);};

  const s=getS(tema);
  useEffect(()=>{document.body.style.background=s.bg;document.body.style.transition='background 0.5s';},[tema]);

  if(yukleniyor)return<div style={{minHeight:'100vh',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}><div style={{textAlign:'center'}}><div style={{fontSize:'32px',fontWeight:'800',background:s.accentGrad,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:'16px'}}>Elsway</div><div style={{color:s.text3,fontSize:'14px'}}>Yükleniyor...</div></div></div>;
  if(kullanici&&rol==='ogrenci')return<OgrenciPaneli tema={tema} kullanici={kullanici} ogrenciData={userData} onCikis={cikisYap}/>;
  if(kullanici&&rol==='veli')return<VeliPaneli tema={tema} kullanici={kullanici} veliData={userData} onCikis={cikisYap}/>;
  if(kullanici)return<KocPaneli tema={tema} kullanici={kullanici} onCikis={cikisYap}/>;
  return<GirisEkrani tema={tema} onGiris={girisYap}/>;
}

export default App;
