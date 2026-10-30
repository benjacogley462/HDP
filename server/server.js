const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const rooms = new Map();
const MAX_PLAYERS = 8;
const MIN_PLAYERS = 3;

const BLACK = [
  'Un asado argentino no está completo sin _____.',
  'La verdadera razón por la que el grupo familiar quedó en silencio fue _____.',
  'Mi plan de ahorro consiste en invertir todo en _____.',
  'En el fondo de la heladera apareció _____.',
  'La peor frase para escuchar en una primera cita es _____.',
  'El nuevo feriado nacional se celebra en honor a _____.',
  'La economía se arregla definitivamente con _____.',
  'Lo que nadie te cuenta de vivir solo es _____.',
  'Mi abogado me recomendó no volver a mencionar _____.',
  'La reunión de consorcio terminó cuando alguien propuso _____.',
  'El secreto para caerle bien a toda la familia es _____.',
  'La peor cosa para encontrar en el mate es _____.',
  'Mi currículum tiene una sección dedicada a _____.',
  'El verdadero tesoro nacional argentino es _____.',
  'La inteligencia artificial todavía no puede explicar _____.',
  'La fiesta se fue de control cuando apareció _____.',
  'El nuevo reality consiste en sobrevivir una semana con _____.',
  'La razón por la que me echaron del trabajo fue _____.',
  'Para invocar al espíritu del asado hay que ofrecer _____.',
  'El peor regalo para un cumpleaños es _____.',
  'Mi superpoder sería poder convertir ____ en _____.',
  'La última cosa que querés escuchar del mecánico es _____.',
  'El manual de convivencia prohíbe expresamente _____.',
  'La frase que arruina cualquier domingo es _____.'
];
const WHITE = [
  'Un tupper sin tapa que nadie se anima a tirar.',
  'Un audio de WhatsApp de nueve minutos y medio.',
  'Un choripán con aspiraciones políticas.',
  'Una impresora que funciona solo cuando la amenazás.',
  'El primo que siempre dice “yo conozco a uno”.',
  'Una transferencia de tres pesos con concepto “perdón”.',
  'Un perro con más estabilidad emocional que toda la familia.',
  'Una milanesa que ocupa toda la mesa.',
  'Un grupo de vecinos organizado por el ruido de una silla.',
  'Un ventilador que hace más ruido que viento.',
  'Un señor explicando economía en la fila del banco.',
  'Un paquete de galletitas con aire premium.',
  'Un Excel con 47 pestañas y cero respuestas.',
  'Una paloma con actitud de dueña del barrio.',
  'Un mate lavado que sigue circulando por compromiso.',
  'Un recibo de luz que parece una amenaza legal.',
  'Un influencer recomendando respirar por la nariz.',
  'Un cajón lleno de cables que no corresponden a nada.',
  'Una empanada con una cantidad preocupante de pasas.',
  'Un vecino que taladra justo cuando te dormís.',
  'Una silla plástica que ya tiene historia clínica.',
  'Un audio que empieza con “no te quiero robar mucho tiempo”.',
  'Una reunión que podría haber sido un mensaje.',
  'Un fernet preparado con precisión de laboratorio.',
  'Un trámite que requiere otro trámite para empezar.',
  'Un gato que te juzga desde arriba de la heladera.',
  'Una oferta imperdible que vence hace tres meses.',
  'Un pan dulce con más fruta que masa.',
  'Una heladera llena de ingredientes que no combinan.',
  'Una tía que pregunta por tu futuro delante de todos.',
  'Un calendario que marca “ya fue” todos los días.',
  'Un algoritmo que te conoce demasiado bien.',
  'Un ticket de supermercado de tamaño sábana.',
  'Un “después vemos” que dura hasta el año que viene.',
  'Un asado que empieza al mediodía y se sirve de noche.',
  'Una contraseña anotada en el lugar más obvio.',
  'Un grupo de trabajo que manda memes a las 2 AM.',
  'Un campeón mundial de opinar sin haber leído nada.',
  'Un cajero automático que decide tomarse el día.',
  'Una planta que sobrevivió a todos tus intentos de cuidarla.',
  'Un bizcochito encontrado en el bolsillo del abrigo.',
  'Una alarma que suena como si debieras plata.',
  'Un tupper heredado de una generación desconocida.',
  'Un brindis incómodo con gente que no conocés.',
  'Una bicicleta fija convertida en perchero.',
  'Una fila que avanza más lento que una actualización.',
  'Un vecino que sabe cuándo te llega un paquete.',
  'Una promo de 2x1 que exige hipotecar la casa.',
  'Un “estoy llegando” enviado desde la ducha.',
  'Una bolsa con bolsas que ya es patrimonio familiar.',
  'Un médico de internet con foto de perfil de auto.',
  'Un sánguche que se desarma en el peor momento.',
  'Una teoría conspirativa explicada con servilletas.',
  'Un brindis por las decisiones que no vamos a recordar.',
  'Una mascota con una cuenta bancaria imaginaria.',
  'Un recibo escrito a mano que nadie puede descifrar.',
  'Una notificación del banco en medio de la cena.',
  'Una licuadora que parece despegar hacia la estratósfera.',
  'Un despertador que recibe insultos personalizados.',
  'Una discusión de fútbol en una mesa de cumpleaños.',
  'Un “te lo dije” con banda sonora de trompetas.',
  'Una bolsa de hielo que llega cuando ya terminó la fiesta.',
  'Un curso online para aprender a procrastinar.',
  'Una medialuna que se cobra como inversión inmobiliaria.',
  'Un contador que calcula hasta los abrazos.',
  'Una medialuna que necesita un préstamo.',
  'Un vecino que pone música para toda la cuadra.',
  'Un cartel de oferta escrito con bronca.',
  'Un grupo de amigos que nunca concreta la salida.',
  'Un paraguas que se da vuelta con la primera brisa.',
  'Una heladera que solo tiene aderezos.',
  'Un podcast de dos horas sobre una pavada.',
  'Un control remoto que aparece en la cocina.',
  'Una factura que llega con música de suspenso.',
  'Un gallo que canta como si pagaran por hora.',
  'Una caja de herramientas con una sola herramienta.',
  'Un “jajaja” enviado para cerrar una conversación.',
  'Un trámite que pide fotocopia de la fotocopia.',
  'Una tostada que cae siempre del lado equivocado.',
  'Un grupo de WhatsApp que se llama “Urgente” y nunca lo es.',
  'Una reunión para organizar otra reunión.',
  'Un mate con gusto a termo olvidado.',
  'Un cajón que guarda pilas que ya no funcionan.',
  'Una promesa de dieta hecha frente a una pizza.'
];

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
const code = () => crypto.randomBytes(3).toString('hex').toUpperCase();
function send(ws, type, data={}) { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({type, ...data})); }
function publicState(room, viewerId=null) {
  const g = room.game;
  if (!g) return {roomCode:room.code, players:room.players.map(p=>({id:p.id,name:p.name,score:p.score,connected:p.connected})), phase:'LOBBY', round:0, cantorId:null, blackCard:null, submissions:[], submittedIds:[], votedIds:[], deck:room.deck, isHost:viewerId===room.hostId, message:'Esperando que el anfitrión configure el mazo e inicie la partida.'};
  return {
    roomCode:room.code, phase:g.phase, round:g.round, cantorId:g.players[g.cantorIndex]?.id, isHost:viewerId===room.hostId,
    blackCard:g.blackCard, players:g.players.map(p=>({id:p.id,name:p.name,score:p.score,connected:p.connected,handCount:p.hand.length})),
    myHand:g.players.find(p=>p.id===viewerId)?.hand || [],
    submissions:g.submissions.map((s,i)=>({index:i,card:s.card,ownerId:g.phase==='READING' || g.phase==='VOTING' || g.phase==='RESULTS' ? s.ownerId : null, votes:g.phase==='RESULTS'?s.votes:undefined})),
    tiebreakCandidates:g.tiebreakCandidates, tiebreakRound:g.tiebreakRound,
    submittedIds:g.submissions.map(s=>s.ownerId), votedIds:Object.keys(g.votes),
    readingIndex:g.readingIndex, message:g.message || ''
  };
}
function broadcast(room) {
  for (const p of room.players) if (p.ws) send(p.ws,'STATE',{state:publicState(room,p.id)});
}
function error(ws, message) { send(ws,'ERROR',{message}); }
function startGame(room) {
  if (room.players.length < MIN_PLAYERS) throw new Error('Se necesitan al menos 3 jugadores.');
  const blackDeck = shuffle(room.deck.black), whiteDeck = shuffle(room.deck.white);
  if (whiteDeck.length < room.players.length * 10) throw new Error(`El mazo necesita al menos ${room.players.length * 10} cartas blancas para repartir 10 a cada jugador.`);
  if (!blackDeck.length) throw new Error('Agregá al menos una consigna negra.');
  room.game = {
    players: room.players.map(p=>({...p, score:0, hand:whiteDeck.splice(0,10)})),
    blackDeck, whiteDeck, round:1, cantorIndex:0, blackCard:null,
    submissions:[], votes:{}, tiebreakCandidates:null, tiebreakRound:0, phase:'SUBMITTING', readingIndex:0, message:'Elegí una carta en secreto.'
  };
  room.players = room.game.players;
  beginRound(room);
}
function beginRound(room) {
  const g=room.game;
  if (g.players.every(p=>p.hand.length===0)) { g.phase='GAME_OVER'; g.message='¡Partida terminada!'; return; }
  if (!g.blackDeck.length) g.blackDeck=shuffle(room.deck.black);
  g.blackCard=g.blackDeck.pop(); g.submissions=[]; g.votes={}; g.tiebreakCandidates=null; g.tiebreakRound=0; g.readingIndex=0;
  g.phase='SUBMITTING'; g.message='Cada jugador elige una carta blanca.';
}
function player(room,id) { return room.players.find(p=>p.id===id); }
function handle(ws, msg) {
  let d; try { d=JSON.parse(msg.toString()); } catch { return error(ws,'Mensaje inválido.'); }
  try {
    if (d.type==='CREATE') {
      const name=String(d.name||'Jugador').trim().slice(0,18)||'Jugador';
      let c=code(); while(rooms.has(c)) c=code();
      const p={id:crypto.randomUUID(),name,score:0,hand:[],ws,connected:true};
      const room={code:c,hostId:p.id,players:[p],game:null,deck:{black:[...BLACK],white:[...WHITE]},created:Date.now()};
      rooms.set(c,room); ws.roomCode=c; ws.playerId=p.id;
      send(ws,'JOINED',{roomCode:c,playerId:p.id,host:true}); broadcast(room); return;
    }
    if (d.type==='JOIN') {
      const c=String(d.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
      const room=rooms.get(c); if(!room) return error(ws,'No existe esa sala. Revisá el código.');
      if(room.game) return error(ws,'La partida ya empezó; no se puede entrar a mitad de juego.');
      if(room.players.length>=MAX_PLAYERS) return error(ws,'La sala está completa (máximo 8 jugadores).');
      const p={id:crypto.randomUUID(),name:String(d.name||'Jugador').trim().slice(0,18)||'Jugador',score:0,hand:[],ws,connected:true};
      room.players.push(p); ws.roomCode=c; ws.playerId=p.id;
      send(ws,'JOINED',{roomCode:c,playerId:p.id,host:false}); broadcast(room); return;
    }
    const room=rooms.get(ws.roomCode); if(!room) return error(ws,'No estás en una sala.');
    const p=player(room,ws.playerId); if(!p) return error(ws,'No se encontró tu jugador.');
    if(d.type==='SET_DECK') {
      if(room.hostId!==p.id) return error(ws,'Solo el anfitrión puede editar el mazo.');
      if(room.game) return error(ws,'El mazo queda bloqueado cuando empieza la partida.');
      const clean = value => Array.isArray(value) ? value.map(x=>String(x).trim()).filter(Boolean) : [];
      const black=clean(d.black), white=clean(d.white);
      if(!black.length || !white.length) return error(ws,'El mazo debe tener al menos una carta negra y una blanca.');
      if(Buffer.byteLength(JSON.stringify({black,white}),'utf8')>500000) return error(ws,'El mazo supera el tamaño máximo permitido de 500 KB.');
      room.deck={black,white}; broadcast(room); return;
    }
    if(d.type==='START') {
      if(room.hostId!==p.id) return error(ws,'Solo quien creó la sala puede iniciar.');
      startGame(room); broadcast(room); return;
    }
    const g=room.game; if(!g) return error(ws,'La partida todavía no empezó.');
    if(d.type==='SUBMIT') {
      if(g.phase!=='SUBMITTING') return error(ws,'Ahora no se reciben cartas.');
      if(g.submissions.some(s=>s.ownerId===p.id)) return error(ws,'Ya enviaste tu carta esta ronda.');
      const idx=Number(d.cardIndex);
      if(!Number.isInteger(idx)||idx<0||idx>=p.hand.length) return error(ws,'Carta inválida.');
      const card=p.hand.splice(idx,1)[0]; g.submissions.push({ownerId:p.id,card,votes:0});
      if(g.submissions.length===g.players.length) { g.submissions=shuffle(g.submissions); g.phase='READING'; g.readingIndex=0; g.message='La Cantora lee las respuestas.'; }
      broadcast(room); return;
    }
    if(d.type==='NEXT_READ') {
      if(g.phase!=='READING') return error(ws,'No estás en la fase de lectura.');
      if(p.id!==g.players[g.cantorIndex].id) return error(ws,'Solo la Cantora puede avanzar la lectura.');
      g.readingIndex++;
      if(g.readingIndex>=g.submissions.length) { g.phase='VOTING'; g.message='Votá tu respuesta favorita. No podés votar la tuya.'; }
      broadcast(room); return;
    }
    if(d.type==='VOTE') {
      if(g.phase!=='VOTING') return error(ws,'Ahora no se puede votar.');
      if(g.votes[p.id]!==undefined) return error(ws,'Ya votaste esta ronda.');
      const idx=Number(d.index), sub=g.submissions[idx];
      if(!sub) return error(ws,'Respuesta inválida.');
      if(sub.ownerId===p.id) return error(ws,'No podés votar tu propia carta.');
      const candidates=g.tiebreakCandidates||g.submissions.map((_,i)=>i);if(!candidates.includes(idx))return error(ws,'Esa respuesta no participa del desempate.');g.votes[p.id]=idx;sub.votes++;
      if(Object.keys(g.votes).length===g.players.length){const max=Math.max(...candidates.map(i=>g.submissions[i].votes)),tied=candidates.filter(i=>g.submissions[i].votes===max);if(tied.length>1){g.tiebreakCandidates=tied;g.tiebreakRound++;g.votes={};g.submissions.forEach(x=>x.votes=0);g.message='¡Empate! Todos vuelven a votar, solo entre las respuestas empatadas.'}else{const winner=player(room,g.submissions[tied[0]].ownerId);if(winner)winner.score++;g.tiebreakCandidates=null;g.phase='RESULTS';g.message='¡Tenemos una respuesta ganadora!'}}
      broadcast(room); return;
    }
    if(d.type==='NEXT_ROUND') {
      if(room.hostId!==p.id) return error(ws,'Solo quien creó la sala puede continuar.');
      if(g.phase!=='RESULTS') return error(ws,'La ronda todavía no terminó.');
      g.round++; g.cantorIndex=(g.cantorIndex+1)%g.players.length; beginRound(room); broadcast(room); return;
    }
  } catch(e) { error(ws,e.message||'No se pudo completar la acción.'); }
}
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/health') { res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}); return res.end(JSON.stringify({ok:true,service:'hdp-servidor'})); }
  const safe=pathname==='/'?'/index.html':pathname;
  const full=path.normalize(path.join(PUBLIC_DIR,safe));
  if(!full.startsWith(PUBLIC_DIR)){res.writeHead(403);return res.end('Forbidden');}
  fs.readFile(full,(err,data)=>{
    if(err){res.writeHead(404);return res.end('No encontrado');}
    const ext=path.extname(full);
    const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json'};
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
  });
});
const wss=new WebSocket.Server({server});
wss.on('connection',ws=>{
  ws.on('message',data=>handle(ws,data));
  ws.on('close',()=>{
    const room=rooms.get(ws.roomCode); if(!room)return;
    const p=player(room,ws.playerId); if(p){p.connected=false;p.ws=null;broadcast(room);}
    // Keep rooms around while a game is running; remove empty waiting rooms.
    if(room.players.every(x=>!x.connected)&&!room.game) rooms.delete(room.code);
  });
});
server.listen(PORT,'0.0.0.0',()=>console.log(`HDP server listening on ${PORT}`));
