// Base de datos: jugadores mundialistas (1958 – 2026).
// Formato de cada jugador: "Nombre|POS|media|año del primer Mundial (opcional)".
// Si un jugador ya apareció en una selección anterior, se lo referencia sólo por nombre.
'use strict';

const COUNTRIES = {
  BRA: { n: 'Brasil', k: 'BRA', c1: '#f9d71c', c2: '#1e8f4e' },
  SUE: { n: 'Suecia', k: 'SUE', c1: '#fecc00', c2: '#006aa7' },
  FRA: { n: 'Francia', k: 'FRA', c1: '#1d3c8f', c2: '#ffffff' },
  CHI: { n: 'Chile', k: 'CHI', c1: '#d52b1e', c2: '#ffffff' },
  TCH: { n: 'Checoslovaquia', k: 'TCH', c1: '#d7141a', c2: '#11457e' },
  PRK: { n: 'Corea del Norte', k: 'PRK', c1: '#c8102e', c2: '#ffffff' },
  ING: { n: 'Inglaterra', k: 'ING', c1: '#ffffff', c2: '#cf142b' },
  POR: { n: 'Portugal', k: 'POR', c1: '#b5121b', c2: '#046a38' },
  ITA: { n: 'Italia', k: 'ITA', c1: '#1f5fbf', c2: '#ffffff' },
  PER: { n: 'Perú', k: 'PER', c1: '#ffffff', c2: '#d91023' },
  HAI: { n: 'Haití', k: 'HAI', c1: '#00209f', c2: '#d21034' },
  ZAI: { n: 'Zaire', k: 'ZAI', c1: '#1c8a3c', c2: '#f7d618' },
  NED: { n: 'Países Bajos', k: 'NED', c1: '#f36c21', c2: '#ffffff' },
  FRG: { n: 'Alemania Fed.', k: 'RFA', c1: '#ffffff', c2: '#111111' },
  POL: { n: 'Polonia', k: 'POL', c1: '#ffffff', c2: '#dc143c' },
  ARG: { n: 'Argentina', k: 'ARG', c1: '#75aadb', c2: '#ffffff' },
  SLV: { n: 'El Salvador', k: 'SLV', c1: '#0f47af', c2: '#ffffff' },
  NZL: { n: 'Nueva Zelanda', k: 'NZL', c1: '#ffffff', c2: '#111111' },
  CMR: { n: 'Camerún', k: 'CMR', c1: '#007a5e', c2: '#fcd116' },
  GER: { n: 'Alemania', k: 'ALE', c1: '#ffffff', c2: '#111111' },
  BOL: { n: 'Bolivia', k: 'BOL', c1: '#007934', c2: '#f9e300' },
  BUL: { n: 'Bulgaria', k: 'BUL', c1: '#ffffff', c2: '#00966e' },
  JAM: { n: 'Jamaica', k: 'JAM', c1: '#fed100', c2: '#009b3a' },
  CRO: { n: 'Croacia', k: 'CRO', c1: '#ffffff', c2: '#e30a17' },
  CHN: { n: 'China', k: 'CHN', c1: '#de2910', c2: '#ffde00' },
  KOR: { n: 'Corea del Sur', k: 'KOR', c1: '#e4002b', c2: '#ffffff' },
  SEN: { n: 'Senegal', k: 'SEN', c1: '#ffffff', c2: '#00853f' },
  ESP: { n: 'España', k: 'ESP', c1: '#c60b1e', c2: '#ffc400' },
  URU: { n: 'Uruguay', k: 'URU', c1: '#5ba4e5', c2: '#ffffff' },
  CRC: { n: 'Costa Rica', k: 'CRC', c1: '#ce1126', c2: '#002b7f' },
  PAN: { n: 'Panamá', k: 'PAN', c1: '#da121a', c2: '#ffffff' },
  MAR: { n: 'Marruecos', k: 'MAR', c1: '#c1272d', c2: '#006233' },
  NOR: { n: 'Noruega', k: 'NOR', c1: '#ba0c2f', c2: '#00205b' },
  BEL: { n: 'Bélgica', k: 'BEL', c1: '#e30613', c2: '#111111' },
  DEN: { n: 'Dinamarca', k: 'DIN', c1: '#c8102e', c2: '#ffffff' },
  ROU: { n: 'Rumania', k: 'RUM', c1: '#fcd116', c2: '#002b7f' },
  TUR: { n: 'Turquía', k: 'TUR', c1: '#e30a17', c2: '#ffffff' },
  USA: { n: 'Estados Unidos', k: 'USA', c1: '#ffffff', c2: '#0a3161' },
  GHA: { n: 'Ghana', k: 'GHA', c1: '#ffffff', c2: '#006b3f' },
  COL: { n: 'Colombia', k: 'COL', c1: '#fcd116', c2: '#003893' },
  RUS: { n: 'Rusia', k: 'RUS', c1: '#ffffff', c2: '#d52b1e' },
  JPN: { n: 'Japón', k: 'JPN', c1: '#0b2d8c', c2: '#ffffff' },
  MEX: { n: 'México', k: 'MEX', c1: '#006847', c2: '#ffffff' },
  AUT: { n: "Austria", k: "AUT", c1: "#ffffff", c2: "#ed2939" },
  HUN: { n: "Hungría", k: "HUN", c1: "#cd2a3e", c2: "#ffffff" },
  URS: { n: "Unión Soviética", k: "URS", c1: "#cc0000", c2: "#ffffff" },
  YUG: { n: "Yugoslavia", k: "YUG", c1: "#0c4076", c2: "#ffffff" },
  SCO: { n: "Escocia", k: "ESC", c1: "#1a2a6c", c2: "#ffffff" },
  WAL: { n: "Gales", k: "GAL", c1: "#c8102e", c2: "#ffffff" },
  NIR: { n: "Irlanda del Norte", k: "NIR", c1: "#00843d", c2: "#ffffff" },
  SUI: { n: "Suiza", k: "SUI", c1: "#d52b1e", c2: "#ffffff" },
  PAR: { n: "Paraguay", k: "PAR", c1: "#d52b1e", c2: "#ffffff" },
  ISR: { n: "Israel", k: "ISR", c1: "#ffffff", c2: "#0038b8" },
  GDR: { n: "Alemania Oriental", k: "RDA", c1: "#0055a4", c2: "#ffffff" },
  AUS: { n: "Australia", k: "AUS", c1: "#ffcd00", c2: "#00843d" },
  TUN: { n: "Túnez", k: "TUN", c1: "#e70013", c2: "#ffffff" },
  IRN: { n: "Irán", k: "IRN", c1: "#ffffff", c2: "#239f40" },
  ALG: { n: "Argelia", k: "ALG", c1: "#ffffff", c2: "#006233" },
  KUW: { n: "Kuwait", k: "KUW", c1: "#0057b8", c2: "#ffffff" },
  HON: { n: "Honduras", k: "HON", c1: "#ffffff", c2: "#0073cf" },
  IRQ: { n: "Irak", k: "IRQ", c1: "#ffffff", c2: "#007a3d" },
  CAN: { n: "Canadá", k: "CAN", c1: "#d80621", c2: "#ffffff" },
  IRL: { n: "Irlanda", k: "IRL", c1: "#169b62", c2: "#ffffff" },
  EGY: { n: "Egipto", k: "EGI", c1: "#ce1126", c2: "#ffffff" },
  UAE: { n: "Emiratos Árabes", k: "EAU", c1: "#ffffff", c2: "#00732f" },
  NGA: { n: "Nigeria", k: "NIG", c1: "#008751", c2: "#ffffff" },
  GRE: { n: "Grecia", k: "GRE", c1: "#0d5eaf", c2: "#ffffff" },
  KSA: { n: "Arabia Saudita", k: "KSA", c1: "#006c35", c2: "#ffffff" },
  RSA: { n: "Sudáfrica", k: "SUD", c1: "#ffb612", c2: "#007a4d" },
  SVN: { n: "Eslovenia", k: "ESV", c1: "#ffffff", c2: "#005da4" },
  ECU: { n: "Ecuador", k: "ECU", c1: "#ffd100", c2: "#034ea2" },
  TRI: { n: "Trinidad y Tobago", k: "TRI", c1: "#ce1126", c2: "#000000" },
  CIV: { n: "Costa de Marfil", k: "CMF", c1: "#f77f00", c2: "#009e60" },
  SCG: { n: "Serbia y Montenegro", k: "SYM", c1: "#003893", c2: "#ffffff" },
  ANG: { n: "Angola", k: "ANG", c1: "#cc092f", c2: "#000000" },
  CZE: { n: "República Checa", k: "RCH", c1: "#d7141a", c2: "#11457e" },
  TOG: { n: "Togo", k: "TOG", c1: "#ffce00", c2: "#006a4e" },
  UKR: { n: "Ucrania", k: "UCR", c1: "#ffd500", c2: "#005bbb" },
  SRB: { n: "Serbia", k: "SER", c1: "#c6363c", c2: "#0c4076" },
  SVK: { n: "Eslovaquia", k: "SVK", c1: "#ffffff", c2: "#0b4ea2" },
  BIH: { n: "Bosnia y Herzegovina", k: "BIH", c1: "#002395", c2: "#fecb00" },
  ISL: { n: "Islandia", k: "ISL", c1: "#02529c", c2: "#ffffff" },
  QAT: { n: "Catar", k: "CAT", c1: "#8a1538", c2: "#ffffff" },
  CUW: { n: "Curazao", k: "CUR", c1: "#002b7f", c2: "#f9e814" },
  CPV: { n: "Cabo Verde", k: "CPV", c1: "#003893", c2: "#ffffff" },
  JOR: { n: "Jordania", k: "JOR", c1: "#ffffff", c2: "#ce1126" },
  COD: { n: "RD Congo", k: "RDC", c1: "#007fff", c2: "#ce1021" },
  UZB: { n: "Uzbekistán", k: "UZB", c1: "#ffffff", c2: "#0099b5" },
};

const TEAMS_RAW = [
  { c: 'BRA', y: 1958, f: '4-2-4', p: [
    "Gilmar|POR|85", "Djalma Santos|LD|86", "Bellini|DFC|82", "Orlando|DFC|80", "Nílton Santos|LI|88",
    "Zito|MC|82", "Didi|MC|91", "Garrincha|ED|94", "Vavá|DC|85", "Pelé|DC|97", "Zagallo|EI|84",
    "José Altafini|DC|82", "Dino Sani|MC|78", "Joel|ED|76"] },
  { c: 'SUE', y: 1958, f: '4-3-3', p: [
    "Kalle Svensson|POR|80", "Orvar Bergmark|LD|78", "Bengt Gustavsson|DFC|77", "Sven Axbom|LI|73",
    "Sigge Parling|MCD|74", "Nils Liedholm|MC|87", "Reino Börjesson|MC|74", "Gunnar Gren|MCO|84",
    "Kurt Hamrin|ED|86", "Agne Simonsson|DC|82", "Lennart Skoglund|EI|83"] },
  { c: 'FRA', y: 1958, f: '4-2-4', p: [
    "Claude Abbes|POR|76", "Raymond Kaelbel|LD|76", "Robert Jonquet|DFC|80", "André Lerond|LI|74",
    "Armand Penverne|MC|76", "Jean-Jacques Marcel|MC|75", "Raymond Kopa|ED|91", "Just Fontaine|DC|90",
    "Roger Piantoni|DC|82", "Jean Vincent|EI|80", "Maryan Wisnieski|ED|77"] },
  { c: 'CHI', y: 1962, f: '4-3-3', p: [
    "Misael Escuti|POR|72", "Luis Eyzaguirre|LD|74", "Raúl Sánchez|DFC|73", "Carlos Contreras|DFC|72",
    "Sergio Navarro|LI|72", "Eladio Rojas|MCD|76", "Jorge Toro|MC|78", "Alberto Fouilloux|MC|74",
    "Jaime Ramírez|ED|75", "Honorino Landa|DC|76", "Leonel Sánchez|EI|82"] },
  { c: 'TCH', y: 1962, f: '4-2-4', p: [
    "Viliam Schrojf|POR|82", "Jiří Tichý|LD|72", "Ján Popluhár|DFC|82", "Svatopluk Pluskal|DFC|78",
    "Ladislav Novák|LI|78", "Josef Masopust|MC|89", "Andrej Kvašňák|MC|78", "Tomáš Pospíchal|ED|75",
    "Adolf Scherer|DC|78", "Josef Kadraba|DC|76", "Josef Jelínek|EI|73"] },
  { c: 'PRK', y: 1966, f: '4-4-2', p: [
    "Li Chan-myung|POR|64", "Pak Li-sup|LD|60", "Shin Yung-kyoo|DFC|61", "Lim Zoong-sun|DFC|62",
    "Oh Yoon-kyung|LI|60", "Kim Bong-hwan|MCD|61", "Im Seung-hwi|MC|62", "Pak Seung-zin|MC|68",
    "Han Bong-zin|ED|64", "Li Dong-woon|EI|63", "Pak Doo-ik|DC|70", "Yang Seung-kook|DC|65"] },
  { c: 'ING', y: 1966, f: '4-4-2', p: [
    "Gordon Banks|POR|90", "George Cohen|LD|79", "Jack Charlton|DFC|82", "Bobby Moore|DFC|91|1962",
    "Ray Wilson|LI|80|1962", "Nobby Stiles|MCD|80", "Alan Ball|MD|83", "Bobby Charlton|MCO|92|1958",
    "Martin Peters|MI|83", "Roger Hunt|DC|80|1962", "Geoff Hurst|DC|85", "Jimmy Greaves|DC|87|1962"] },
  { c: 'POR', y: 1966, f: '4-2-4', p: [
    "José Pereira|POR|75", "João Morais|LD|73", "Alexandre Baptista|DFC|74", "Vicente|DFC|77",
    "Hilário|LI|75", "Jaime Graça|MCD|77", "Mário Coluna|MC|86", "José Augusto|ED|81",
    "Eusébio|DC|95", "José Torres|DC|82", "António Simões|EI|80"] },
  { c: 'BRA', y: 1970, f: '4-3-3', p: [
    "Félix|POR|76", "Carlos Alberto|LD|89", "Brito|DFC|79|1966", "Piazza|DFC|80", "Everaldo|LI|77",
    "Gérson|MC|88|1966", "Clodoaldo|MCD|82", "Rivellino|MCO|89", "Jairzinho|ED|90|1966",
    "Tostão|DC|88|1966", "Pelé", "Paulo César Caju|EI|80", "Roberto Miranda|DC|74", "Marco Antônio|LI|75"] },
  { c: 'ITA', y: 1970, f: '4-3-3', p: [
    "Enrico Albertosi|POR|82|1962", "Tarcisio Burgnich|LD|82|1966", "Roberto Rosato|DFC|79|1966",
    "Pierluigi Cera|DFC|76", "Giacinto Facchetti|LI|88|1966", "Giancarlo De Sisti|MC|79",
    "Mario Bertini|MCD|76", "Sandro Mazzola|MCO|87|1966", "Angelo Domenghini|ED|78",
    "Roberto Boninsegna|DC|81", "Luigi Riva|DC|89", "Gianni Rivera|MCO|89|1962"] },
  { c: 'PER', y: 1970, f: '4-3-3', p: [
    "Luis Rubiños|POR|70", "Eloy Campos|LD|70", "Héctor Chumpitaz|DFC|82", "Orlando de la Torre|DFC|72",
    "Nicolás Fuentes|LI|71", "Roberto Challe|MC|76", "Ramón Mifflin|MCD|76", "Teófilo Cubillas|MCO|88",
    "Julio Baylón|ED|74", "Pedro Pablo León|DC|76", "Alberto Gallardo|EI|78"] },
  { c: 'HAI', y: 1974, f: '4-4-2', p: [
    "Henri Françillon|POR|70", "Pierre Bayonne|LD|60", "Wilner Nazaire|DFC|62", "Arsène Auguste|DFC|63",
    "Fritz André|LI|60", "Ernst Jean-Joseph|MCD|61", "Jean-Claude Désir|MC|63", "Philippe Vorbe|MC|66",
    "Roger Saint-Vil|ED|64", "Guy Saint-Vil|EI|64", "Emmanuel Sanon|DC|72"] },
  { c: 'ZAI', y: 1974, f: '4-4-2', p: [
    "Kazadi Mwamba|POR|62", "Mwepu Ilunga|LD|60", "Lobilo Boba|DFC|61", "Bwanga Tshimen|DFC|62",
    "Mukombo Mwanza|LI|59", "Mana Mamuwene|MCD|60", "Kilasu Massamba|MC|61", "Kidumu Mantantu|MC|63",
    "Mayanga Maku|MCO|62", "Kakoko Etepe|ED|64", "Mulamba Ndaye|DC|66"] },
  { c: 'NED', y: 1974, f: '4-3-3', p: [
    "Jan Jongbloed|POR|74", "Wim Suurbier|LD|81", "Wim Rijsbergen|DFC|78", "Arie Haan|DFC|84",
    "Ruud Krol|LI|87", "Johan Neeskens|MC|89", "Wim Jansen|MCD|80", "Wim van Hanegem|MC|86",
    "Johnny Rep|ED|84", "Johan Cruyff|DC|96", "Rob Rensenbrink|EI|87"] },
  { c: 'FRG', y: 1974, f: '4-3-3', p: [
    "Sepp Maier|POR|90|1966", "Berti Vogts|LD|84|1970", "Hans-Georg Schwarzenbeck|DFC|80",
    "Franz Beckenbauer|DFC|96|1966", "Paul Breitner|LI|88", "Uli Hoeneß|MC|84", "Rainer Bonhof|MCD|83",
    "Wolfgang Overath|MC|87|1966", "Jürgen Grabowski|ED|82|1970", "Gerd Müller|DC|94|1970",
    "Bernd Hölzenbein|EI|80"] },
  { c: 'POL', y: 1974, f: '4-3-3', p: [
    "Jan Tomaszewski|POR|82", "Antoni Szymanowski|LD|76", "Jerzy Gorgoń|DFC|79", "Władysław Żmuda|DFC|80",
    "Adam Musiał|LI|74", "Henryk Kasperczak|MC|79", "Zygmunt Maszczyk|MCD|75", "Kazimierz Deyna|MCO|88",
    "Grzegorz Lato|ED|88", "Andrzej Szarmach|DC|84", "Robert Gadocha|EI|82"] },
  { c: 'ARG', y: 1978, f: '4-4-2', p: [
    "Ubaldo Fillol|POR|87|1974", "Jorge Olguín|LD|77", "Luis Galván|DFC|77", "Daniel Passarella|DFC|89",
    "Alberto Tarantini|LI|79", "Daniel Bertoni|MD|81", "Osvaldo Ardiles|MC|85", "Américo Gallego|MCD|80",
    "Oscar Ortiz|MI|76", "Mario Kempes|DC|92|1974", "Leopoldo Luque|DC|82", "René Houseman|ED|80|1974"] },
  { c: 'SLV', y: 1982, f: '4-4-2', p: [
    "Luis Guevara Mora|POR|66", "Mario Castillo|LD|61", "Jaime Rodríguez|DFC|64", "Carlos Recinos|DFC|62",
    "Francisco Jovel|LI|61", "Joaquín Ventura|MCD|61", "José Luis Rugamas|MC|62", "Norberto Huezo|MC|65",
    "Jorge \"Mágico\" González|MCO|82", "Silvio Aquino|DC|62", "Luis Ramírez Zapata|DC|64"] },
  { c: 'NZL', y: 1982, f: '4-4-2', p: [
    "Frank van Hattum|POR|63", "Adrian Elrick|LD|61", "Glenn Dods|DFC|61", "Bobby Almond|DFC|62",
    "Ricki Herbert|LI|64", "Kenny Cresswell|MCD|61", "Duncan Cole|MC|63", "Steve Sumner|MC|66",
    "Brian Turner|MCO|65", "Steve Wooddin|DC|66", "Wynton Rufer|DC|68", "Allan Boath|DFC|60"] },
  { c: 'ITA', y: 1982, f: '4-4-2', p: [
    "Dino Zoff|POR|89|1970", "Claudio Gentile|LD|85|1978", "Fulvio Collovati|DFC|80|1978",
    "Gaetano Scirea|DFC|89|1978", "Antonio Cabrini|LI|84|1978", "Bruno Conti|MD|86", "Marco Tardelli|MC|86|1978",
    "Gabriele Oriali|MCD|79", "Giancarlo Antognoni|MCO|85|1978", "Paolo Rossi|DC|90|1978",
    "Francesco Graziani|DC|80|1978", "Alessandro Altobelli|DC|81", "Giuseppe Bergomi|DFC|78"] },
  { c: 'BRA', y: 1982, f: '4-2-3-1', p: [
    "Waldir Peres|POR|74|1974", "Leandro|LD|83", "Oscar|DFC|80|1978", "Luizinho|DFC|78", "Júnior|LI|86",
    "Toninho Cerezo|MCD|85|1978", "Falcão|MC|90", "Sócrates|MCO|91", "Zico|MCO|94|1978", "Éder|EI|84",
    "Serginho Chulapa|DC|74"] },
  { c: 'ARG', y: 1986, f: '3-5-2', p: [
    "Nery Pumpido|POR|79", "José Luis Cuciuffo|DFC|75", "José Luis Brown|DFC|77", "Oscar Ruggeri|DFC|82",
    "Ricardo Giusti|MD|76", "Sergio Batista|MCD|79", "Héctor Enrique|MC|76", "Diego Maradona|MCO|97|1982",
    "Julio Olarticoechea|MI|75|1982", "Jorge Burruchaga|MC|85", "Jorge Valdano|DC|86|1982", "Daniel Passarella"] },
  { c: 'CMR', y: 1990, f: '4-4-2', p: [
    "Thomas N'Kono|POR|83|1982", "Stephen Tataw|LD|70", "Benjamin Massing|DFC|70", "Emmanuel Kundé|DFC|74|1982",
    "Bertin Ebwellé|LI|69", "Cyrille Makanaky|MD|74", "Émile Mbouh|MC|72", "André Kana-Biyik|MCD|72",
    "Louis-Paul M'Fédé|MCO|75", "François Omam-Biyik|DC|79", "Roger Milla|DC|86|1982"] },
  { c: 'FRG', y: 1990, f: '3-5-2', p: [
    "Bodo Illgner|POR|82", "Jürgen Kohler|DFC|84|1986", "Klaus Augenthaler|DFC|82|1986",
    "Guido Buchwald|MCD|82", "Thomas Berthold|LD|79|1986", "Thomas Häßler|MC|82",
    "Lothar Matthäus|MC|93|1982", "Andreas Brehme|LI|86|1986", "Pierre Littbarski|ED|83|1982",
    "Rudi Völler|DC|87|1986", "Jürgen Klinsmann|DC|88"] },
  { c: 'BOL', y: 1994, f: '4-4-2', p: [
    "Carlos Trucco|POR|72", "Gustavo Quinteros|LD|69", "Marco Sandy|DFC|72", "Miguel Rimba|DFC|70",
    "Juan Manuel Peña|DFC|70", "Luis Cristaldo|LI|70", "Carlos Borja|MCD|71", "Julio César Baldivieso|MC|77",
    "Erwin Sánchez|MC|76", "Marco Etcheverry|MCO|82", "William Ramallo|DC|72", "Jaime Moreno|DC|71",
    "Álvaro Peña|DC|70"] },
  { c: 'BUL', y: 1994, f: '4-4-2', p: [
    "Borislav Mihaylov|POR|80|1986", "Emil Kremenliev|LD|72", "Petar Hubchev|DFC|74", "Trifon Ivanov|DFC|80",
    "Tsanko Tsvetanov|LI|74", "Zlatko Yankov|MCD|75", "Yordan Letchkov|MC|83", "Krasimir Balakov|MCO|86",
    "Emil Kostadinov|ED|82", "Hristo Stoichkov|DC|92", "Nasko Sirakov|DC|79|1986"] },
  { c: 'BRA', y: 1994, f: '4-4-2', p: [
    "Taffarel|POR|83|1990", "Jorginho|LD|82|1990", "Aldair|DFC|84|1990", "Márcio Santos|DFC|77",
    "Branco|LI|79|1986", "Mazinho|MD|79|1990", "Mauro Silva|MCD|82", "Dunga|MC|84|1990", "Zinho|MI|78",
    "Bebeto|DC|87|1990", "Romário|DC|93|1990", "Ronaldo|DC|96"] },
  { c: 'JAM', y: 1998, f: '4-4-2', p: [
    "Warren Barrett|POR|68", "Frank Sinclair|DFC|72", "Ian Goodison|DFC|69", "Darryl Powell|MCD|70",
    "Fitzroy Simpson|MC|69", "Robbie Earle|MC|74", "Theodore Whitmore|MCO|74", "Ricardo Gardner|MI|73",
    "Deon Burton|DC|72", "Paul Hall|DC|70", "Onandi Lowe|DC|68"] },
  { c: 'FRA', y: 1998, f: '4-2-3-1', p: [
    "Fabien Barthez|POR|87", "Lilian Thuram|LD|88", "Marcel Desailly|DFC|89", "Laurent Blanc|DFC|87",
    "Bixente Lizarazu|LI|86", "Didier Deschamps|MCD|84", "Emmanuel Petit|MC|84", "Christian Karembeu|MD|79",
    "Zinedine Zidane|MCO|96", "Youri Djorkaeff|MCO|86", "Stéphane Guivarc'h|DC|73", "Thierry Henry|ED|85",
    "David Trezeguet|DC|82"] },
  { c: 'CRO', y: 1998, f: '3-5-2', p: [
    "Dražen Ladić|POR|78", "Slaven Bilić|DFC|79", "Igor Štimac|DFC|80", "Dario Šimić|DFC|77",
    "Mario Stanić|MD|79", "Aljoša Asanović|MC|81", "Zvonimir Boban|MCO|87", "Robert Prosinečki|MCO|86",
    "Robert Jarni|LI|80", "Goran Vlaović|DC|79", "Davor Šuker|DC|89"] },
  { c: 'CHN', y: 2002, f: '4-4-2', p: [
    "Jiang Jin|POR|64", "Sun Jihai|LD|70", "Fan Zhiyi|DFC|70", "Li Weifeng|DFC|68", "Wu Chengying|LI|63",
    "Li Tie|MCD|68", "Zhao Junzhe|MC|66", "Qi Hong|MC|62", "Ma Mingyu|MI|66", "Hao Haidong|DC|69",
    "Yang Chen|DC|66"] },
  { c: 'KOR', y: 2002, f: '3-5-2', p: [
    "Lee Woon-jae|POR|76|1994", "Choi Jin-cheul|DFC|72", "Hong Myung-bo|DFC|80|1990", "Kim Tae-young|DFC|72",
    "Song Chong-gug|MD|74", "Kim Nam-il|MCD|74", "Yoo Sang-chul|MC|76|1998", "Park Ji-sung|MCO|80",
    "Lee Young-pyo|MI|77", "Seol Ki-hyeon|DC|74", "Ahn Jung-hwan|DC|77"] },
  { c: 'SEN', y: 2002, f: '4-4-2', p: [
    "Tony Sylva|POR|74", "Ferdinand Coly|LD|70", "Lamine Diatta|DFC|73", "Pape Malick Diop|DFC|71",
    "Omar Daf|LI|70", "Aliou Cissé|MCD|73", "Papa Bouba Diop|MC|77", "Salif Diao|MC|74",
    "Khalilou Fadiga|MI|79", "Henri Camara|DC|76", "El Hadji Diouf|DC|82"] },
  { c: 'BRA', y: 2002, f: '3-5-2', p: [
    "Marcos|POR|83", "Lúcio|DFC|85", "Edmílson|DFC|79", "Roque Júnior|DFC|78", "Cafu|LD|89|1994",
    "Gilberto Silva|MCD|82", "Kléberson|MC|77", "Ronaldinho|MCO|91", "Roberto Carlos|LI|90|1998",
    "Rivaldo|MCO|91|1998", "Ronaldo"] },
  { c: 'ITA', y: 2006, f: '4-2-3-1', p: [
    "Gianluigi Buffon|POR|93|1998", "Gianluca Zambrotta|LD|85|2002", "Fabio Cannavaro|DFC|91|1998",
    "Marco Materazzi|DFC|82|2002", "Fabio Grosso|LI|79", "Gennaro Gattuso|MCD|85|2002", "Andrea Pirlo|MC|91",
    "Mauro Camoranesi|MD|81", "Francesco Totti|MCO|89|2002", "Simone Perrotta|MC|78", "Luca Toni|DC|84",
    "Alessandro Del Piero|DC|89|1998", "Daniele De Rossi|MC|83"] },
  { c: 'ESP', y: 2010, f: '4-2-3-1', p: [
    "Iker Casillas|POR|91|2002", "Sergio Ramos|LD|87|2006", "Gerard Piqué|DFC|86", "Carles Puyol|DFC|88|2002",
    "Joan Capdevila|LI|79", "Sergio Busquets|MCD|86", "Xabi Alonso|MC|88|2006", "Pedro|ED|81",
    "Xavi|MC|93|2002", "Andrés Iniesta|MCO|92|2006", "David Villa|DC|89|2006", "Fernando Torres|DC|85|2006"] },
  { c: 'URU', y: 2010, f: '4-3-3', p: [
    "Fernando Muslera|POR|79", "Maxi Pereira|LD|78", "Diego Lugano|DFC|81", "Diego Godín|DFC|82",
    "Jorge Fucile|LI|74", "Egidio Arévalo Ríos|MCD|76", "Diego Pérez|MC|75", "Álvaro Pereira|MI|77",
    "Diego Forlán|DC|89|2002", "Luis Suárez|DC|87", "Edinson Cavani|DC|83"] },
  { c: 'GER', y: 2014, f: '4-3-3', p: [
    "Manuel Neuer|POR|92|2010", "Philipp Lahm|LD|90|2006", "Jérôme Boateng|DFC|86|2010", "Mats Hummels|DFC|87",
    "Benedikt Höwedes|LI|79", "Bastian Schweinsteiger|MCD|88|2006", "Toni Kroos|MC|89|2010",
    "Mesut Özil|MCO|87|2010", "Thomas Müller|ED|87|2010", "Miroslav Klose|DC|86|2002", "Mario Götze|EI|82",
    "André Schürrle|EI|81"] },
  { c: 'CRC', y: 2014, f: '5-3-2', p: [
    "Keylor Navas|POR|86", "Cristian Gamboa|LD|72", "Giancarlo González|DFC|74", "Michael Umaña|DFC|72|2006",
    "Óscar Duarte|DFC|72", "Júnior Díaz|LI|72", "Yeltsin Tejeda|MCD|72", "Celso Borges|MC|76",
    "Christian Bolaños|ED|73|2006", "Bryan Ruiz|MCO|80", "Joel Campbell|DC|77"] },
  { c: 'PAN', y: 2018, f: '4-4-2', p: [
    "Jaime Penedo|POR|72", "Michael Murillo|LD|70", "Román Torres|DFC|74", "Fidel Escobar|DFC|69",
    "Felipe Baloy|DFC|70", "Eric Davis|LI|68", "Gabriel Gómez|MCD|70", "Aníbal Godoy|MC|71",
    "Armando Cooper|MC|69", "Édgar Bárcenas|MD|69", "Blas Pérez|DC|70", "Gabriel Torres|DC|69",
    "Luis Tejada|DC|68"] },
  { c: 'FRA', y: 2018, f: '4-2-3-1', p: [
    "Hugo Lloris|POR|87|2010", "Benjamin Pavard|LD|80", "Raphaël Varane|DFC|87|2014", "Samuel Umtiti|DFC|84",
    "Lucas Hernández|LI|80", "N'Golo Kanté|MCD|89", "Paul Pogba|MC|87|2014", "Kylian Mbappé|ED|90",
    "Antoine Griezmann|MCO|89|2014", "Blaise Matuidi|MI|82|2014", "Olivier Giroud|DC|83|2014"] },
  { c: 'CRO', y: 2018, f: '4-2-3-1', p: [
    "Danijel Subašić|POR|81|2014", "Šime Vrsaljko|LD|80|2014", "Dejan Lovren|DFC|81|2014",
    "Domagoj Vida|DFC|80|2014", "Ivan Strinić|LI|76", "Marcelo Brozović|MCD|82|2014", "Ivan Rakitić|MC|87|2014",
    "Ante Rebić|MD|79|2014", "Luka Modrić|MCO|92|2006", "Ivan Perišić|EI|85|2014", "Mario Mandžukić|DC|85|2014"] },
  { c: 'ARG', y: 2022, f: '4-3-3', p: [
    "Emiliano Martínez|POR|86", "Nahuel Molina|LD|79", "Cristian Romero|DFC|84", "Nicolás Otamendi|DFC|82|2010",
    "Nicolás Tagliafico|LI|78", "Rodrigo De Paul|MC|83", "Enzo Fernández|MCD|82", "Alexis Mac Allister|MC|82",
    "Lionel Messi|ED|96|2006", "Julián Álvarez|DC|82", "Ángel Di María|EI|86|2010",
    "Lautaro Martínez|DC|85|2018", "Marcos Acuña|LI|78|2018"] },
  { c: 'MAR', y: 2022, f: '4-3-3', p: [
    "Yassine Bounou|POR|84|2018", "Achraf Hakimi|LD|86|2018", "Nayef Aguerd|DFC|79", "Romain Saïss|DFC|79|2018",
    "Noussair Mazraoui|LI|79", "Sofyan Amrabat|MCD|82|2018", "Azzedine Ounahi|MC|77", "Selim Amallah|MC|74",
    "Hakim Ziyech|ED|83|2018", "Youssef En-Nesyri|DC|79|2018", "Sofiane Boufal|EI|77"] },
  { c: 'NOR', y: 2026, f: '4-3-3', p: [
    "Ørjan Nyland|POR|76", "Julian Ryerson|LD|78", "Kristoffer Ajer|DFC|77", "Leo Østigård|DFC|77",
    "David Møller Wolfe|LI|74", "Sander Berge|MCD|79", "Patrick Berg|MC|76", "Martin Ødegaard|MCO|87",
    "Oscar Bobb|ED|78", "Erling Haaland|DC|92", "Antonio Nusa|EI|79", "Alexander Sørloth|DC|82"] },
  { c: 'ESP', y: 2026, f: '4-3-3', p: [
    "Unai Simón|POR|84|2022", "Pedro Porro|LD|82", "Dean Huijsen|DFC|82", "Pau Cubarsí|DFC|83",
    "Marc Cucurella|LI|83", "Rodri|MCD|91|2022", "Pedri|MC|88|2022", "Fabián Ruiz|MC|84",
    "Lamine Yamal|ED|91", "Mikel Oyarzabal|DC|82", "Nico Williams|EI|85|2022"] },
  { c: 'ING', y: 2026, f: '4-2-3-1', p: [
    "Jordan Pickford|POR|83|2018", "Reece James|LD|83|2022", "John Stones|DFC|84|2018", "Marc Guéhi|DFC|83",
    "Luke Shaw|LI|80|2018", "Declan Rice|MCD|87|2022", "Cole Palmer|MC|86", "Bukayo Saka|MD|87|2022",
    "Jude Bellingham|MCO|89|2022", "Phil Foden|MI|86|2022", "Harry Kane|DC|90|2018", "Anthony Gordon|EI|81"] },
  // ---------- Más selecciones que jugaron los Mundiales ----------
  { c: 'BRA', y: 1962, f: '4-2-4', p: [
    "Gilmar", "Djalma Santos", "Mauro Ramos|DFC|81|1962", "Zózimo|DFC|79|1962", "Nílton Santos", "Zito", "Didi",
    "Garrincha", "Vavá", "Amarildo|DC|84|1962", "Zagallo", "Pelé", "Coutinho|DC|82|1962"] },
  { c: 'FRG', y: 1966, f: '4-3-3', p: [
    "Hans Tilkowski|POR|80|1966", "Horst-Dieter Höttges|LD|78|1966", "Willi Schulz|DFC|80|1966", "Wolfgang Weber|DFC|79|1966",
    "Karl-Heinz Schnellinger|LI|84|1962", "Franz Beckenbauer", "Wolfgang Overath", "Helmut Haller|MCO|83|1962",
    "Lothar Emmerich|ED|78|1966", "Uwe Seeler|DC|89|1958", "Siegfried Held|EI|79|1966"] },
  { c: 'FRG', y: 1970, f: '4-3-3', p: [
    "Sepp Maier", "Berti Vogts", "Klaus Fichtel|DFC|79|1970", "Karl-Heinz Schnellinger", "Franz Beckenbauer",
    "Wolfgang Overath", "Jürgen Grabowski", "Reinhard Libuda|ED|80|1970", "Uwe Seeler", "Gerd Müller", "Hannes Löhr|EI|78|1970"] },
  { c: 'ING', y: 1970, f: '4-4-2', p: [
    "Gordon Banks", "Keith Newton|LD|78|1970", "Brian Labone|DFC|79|1970", "Bobby Moore", "Terry Cooper|LI|80|1970",
    "Alan Mullery|MCD|80|1970", "Alan Ball", "Bobby Charlton", "Martin Peters", "Colin Bell|MC|82|1970",
    "Francis Lee|DC|82|1970", "Geoff Hurst"] },
  { c: 'NED', y: 1978, f: '4-3-3', p: [
    "Jan Jongbloed", "Wim Suurbier", "Ernie Brandts|DFC|78|1978", "Ruud Krol", "Jan Poortvliet|LI|76|1978", "Wim Jansen",
    "Arie Haan", "Willy van de Kerkhof|MC|80|1978", "René van de Kerkhof|ED|81|1978", "Johnny Rep", "Rob Rensenbrink",
    "Dick Nanninga|DC|76|1978"] },
  { c: 'BRA', y: 1978, f: '4-3-3', p: [
    "Émerson Leão|POR|83|1974", "Toninho|LD|76|1978", "Oscar", "Amaral|DFC|79|1978", "Rodrigues Neto|LI|75|1978",
    "Toninho Cerezo", "Batista|MCD|77|1978", "Dirceu|MC|83|1974", "Zico", "Gil|ED|78|1978", "Roberto Dinamite|DC|85|1978", "Rivellino"] },
  { c: 'ITA', y: 1978, f: '4-3-3', p: [
    "Dino Zoff", "Claudio Gentile", "Mauro Bellugi|DFC|78|1978", "Gaetano Scirea", "Antonio Cabrini", "Romeo Benetti|MCD|80|1974",
    "Marco Tardelli", "Giancarlo Antognoni", "Franco Causio|ED|84|1974", "Paolo Rossi", "Roberto Bettega|DC|86|1978"] },
  { c: 'FRG', y: 1982, f: '4-4-2', p: [
    "Harald Schumacher|POR|85|1982", "Manfred Kaltz|LD|83|1978", "Karlheinz Förster|DFC|83|1982", "Uli Stielike|DFC|84|1982",
    "Hans-Peter Briegel|LI|82|1982", "Paul Breitner", "Wolfgang Dremmler|MC|77|1982", "Felix Magath|MC|80|1982",
    "Pierre Littbarski", "Karl-Heinz Rummenigge|DC|90|1978", "Klaus Fischer|DC|83|1982", "Horst Hrubesch|DC|80|1982"] },
  { c: 'FRA', y: 1982, f: '4-4-2', p: [
    "Jean-Luc Ettori|POR|76|1982", "Manuel Amoros|LD|83|1982", "Marius Trésor|DFC|85|1978", "Gérard Janvion|DFC|78|1978",
    "Maxime Bossis|LI|83|1978", "Jean Tigana|MC|87|1982", "Alain Giresse|MC|87|1982", "Michel Platini|MCO|95|1978",
    "Bernard Genghini|MC|79|1982", "Dominique Rocheteau|DC|83|1978", "Didier Six|EI|80|1978"] },
  { c: 'POL', y: 1982, f: '4-4-2', p: [
    "Józef Młynarczyk|POR|80|1982", "Marek Dziuba|LD|74|1982", "Władysław Żmuda", "Paweł Janas|DFC|76|1982",
    "Stefan Majewski|LI|74|1982", "Janusz Kupcewicz|MC|76|1982", "Waldemar Matysik|MC|75|1982", "Andrzej Buncol|MC|78|1982",
    "Grzegorz Lato", "Zbigniew Boniek|DC|88|1978", "Włodzimierz Smolarek|DC|80|1982"] },
  { c: 'FRG', y: 1986, f: '4-4-2', p: [
    "Harald Schumacher", "Thomas Berthold", "Karlheinz Förster", "Ditmar Jakobs|DFC|79|1986", "Hans-Peter Briegel",
    "Norbert Eder|DFC|76|1986", "Lothar Matthäus", "Felix Magath", "Andreas Brehme", "Karl-Heinz Rummenigge", "Rudi Völler",
    "Klaus Allofs|DC|81|1986"] },
  { c: 'FRA', y: 1986, f: '4-4-2', p: [
    "Joël Bats|POR|82|1986", "Manuel Amoros", "Patrick Battiston|DFC|80|1982", "Maxime Bossis", "William Ayache|LI|74|1986",
    "Luis Fernández|MCD|84|1986", "Jean Tigana", "Alain Giresse", "Michel Platini", "Dominique Rocheteau",
    "Yannick Stopyra|DC|79|1986", "Jean-Pierre Papin|DC|84|1986"] },
  { c: 'BRA', y: 1986, f: '4-4-2', p: [
    "Carlos|POR|80|1986", "Josimar|LD|80|1986", "Júlio César|DFC|81|1986", "Edinho|DFC|79|1986", "Branco",
    "Elzo|MCD|77|1986", "Alemão|MC|80|1986", "Sócrates", "Júnior", "Zico", "Careca|DC|88|1986", "Müller|ED|81|1986"] },
  { c: 'DEN', y: 1986, f: '3-5-2', p: [
    "Troels Rasmussen|POR|76|1986", "Søren Busk|DFC|77|1986", "Morten Olsen|DFC|84|1986", "Ivan Nielsen|DFC|77|1986",
    "John Sivebæk|MD|75|1986", "Søren Lerby|MC|84|1986", "Jens Jørn Bertelsen|MCD|77|1986", "Frank Arnesen|MC|83|1986",
    "Jesper Olsen|MI|82|1986", "Michael Laudrup|MCO|90|1986", "Preben Elkjær|DC|88|1986", "Klaus Berggreen|MC|78|1986"] },
  { c: 'BEL', y: 1986, f: '4-4-2', p: [
    "Jean-Marie Pfaff|POR|86|1982", "Eric Gerets|LD|84|1982", "Georges Grün|DFC|79|1986", "Stéphane Demol|DFC|76|1986",
    "Michel Renquin|LI|75|1986", "René Vandereycken|MCD|78|1982", "Franky Vercauteren|MC|80|1982", "Enzo Scifo|MCO|86|1986",
    "Jan Ceulemans|DC|85|1982", "Nico Claesen|DC|79|1986", "Daniel Veyt|DC|76|1986"] },
  { c: 'ING', y: 1986, f: '4-4-2', p: [
    "Peter Shilton|POR|86|1982", "Gary Stevens|LD|77|1986", "Terry Butcher|DFC|81|1982", "Terry Fenwick|DFC|76|1986",
    "Kenny Sansom|LI|80|1982", "Trevor Steven|MD|79|1986", "Glenn Hoddle|MC|86|1982", "Peter Reid|MC|79|1986",
    "Steve Hodge|MI|76|1986", "Gary Lineker|DC|88|1986", "Peter Beardsley|DC|84|1986", "Chris Waddle|ED|82|1986"] },
  { c: 'ARG', y: 1990, f: '3-5-2', p: [
    "Sergio Goycochea|POR|83|1990", "Juan Ernesto Simón|DFC|77|1990", "Oscar Ruggeri", "José Serrizuela|DFC|75|1990",
    "Ricardo Giusti", "José Basualdo|MC|76|1990", "Pedro Troglio|MC|77|1990", "Julio Olarticoechea", "Diego Maradona",
    "Jorge Burruchaga", "Claudio Caniggia|DC|86|1990", "Gustavo Dezotti|DC|75|1990"] },
  { c: 'ITA', y: 1990, f: '4-4-2', p: [
    "Walter Zenga|POR|87|1986", "Giuseppe Bergomi", "Riccardo Ferri|DFC|80|1990", "Franco Baresi|DFC|91|1990",
    "Paolo Maldini|LI|91|1990", "Roberto Donadoni|MD|84|1990", "Fernando De Napoli|MC|79|1986", "Carlo Ancelotti|MC|81|1990",
    "Giuseppe Giannini|MCO|83|1990", "Roberto Baggio|DC|92|1990", "Salvatore Schillaci|DC|86|1990", "Gianluca Vialli|DC|85|1986"] },
  { c: 'ING', y: 1990, f: '4-4-2', p: [
    "Peter Shilton", "Paul Parker|LD|78|1990", "Des Walker|DFC|82|1990", "Mark Wright|DFC|80|1990", "Terry Butcher",
    "Stuart Pearce|LI|83|1990", "Chris Waddle", "Paul Gascoigne|MC|88|1990", "David Platt|MC|84|1990", "Bryan Robson|MC|85|1982",
    "Gary Lineker", "Peter Beardsley"] },
  { c: 'NED', y: 1990, f: '4-4-2', p: [
    "Hans van Breukelen|POR|83|1990", "Berry van Aerle|LD|76|1990", "Ronald Koeman|DFC|87|1990", "Frank Rijkaard|MCD|90|1990",
    "Adri van Tiggelen|LI|77|1990", "Jan Wouters|MC|80|1990", "Aron Winter|MC|78|1990", "Erwin Koeman|MC|77|1990",
    "Ruud Gullit|MCO|91|1990", "Marco van Basten|DC|93|1990", "Hans Gillhaus|DC|75|1990"] },
  { c: 'ITA', y: 1994, f: '4-4-2', p: [
    "Gianluca Pagliuca|POR|85|1994", "Roberto Mussi|LD|77|1994", "Franco Baresi", "Alessandro Costacurta|DFC|84|1994",
    "Paolo Maldini", "Antonio Benarrivo|LI|77|1994", "Roberto Donadoni", "Dino Baggio|MC|80|1994", "Demetrio Albertini|MC|84|1994",
    "Nicola Berti|MC|80|1990", "Roberto Baggio", "Daniele Massaro|DC|79|1994", "Giuseppe Signori|DC|84|1994"] },
  { c: 'SUE', y: 1994, f: '4-4-2', p: [
    "Thomas Ravelli|POR|83|1990", "Roland Nilsson|LD|80|1990", "Patrik Andersson|DFC|81|1994", "Joachim Björklund|DFC|77|1994",
    "Roger Ljung|LI|75|1990", "Jonas Thern|MC|80|1990", "Stefan Schwarz|MC|81|1990", "Klas Ingesson|MC|77|1990",
    "Tomas Brolin|MCO|86|1990", "Martin Dahlin|DC|83|1994", "Kennet Andersson|DC|84|1994", "Henrik Larsson|DC|85|1994"] },
  { c: 'ROU', y: 1994, f: '5-3-2', p: [
    "Florin Prunea|POR|75|1994", "Dan Petrescu|LD|82|1994", "Daniel Prodan|DFC|77|1994", "Miodrag Belodedici|DFC|80|1994",
    "Gheorghe Popescu|DFC|84|1990", "Tibor Selymes|LI|74|1994", "Ioan Lupescu|MCD|78|1990", "Dorinel Munteanu|MC|78|1994",
    "Gheorghe Hagi|MCO|92|1990", "Ilie Dumitrescu|DC|83|1994", "Florin Răducioiu|DC|82|1990"] },
  { c: 'ARG', y: 1994, f: '4-4-2', p: [
    "Luis Islas|POR|78|1994", "Roberto Sensini|LD|80|1990", "Oscar Ruggeri", "Fernando Cáceres|DFC|77|1994",
    "José Chamot|LI|80|1994", "Fernando Redondo|MCD|89|1994", "Diego Simeone|MC|84|1994", "Diego Maradona",
    "Ariel Ortega|MCO|83|1994", "Gabriel Batistuta|DC|91|1994", "Claudio Caniggia", "Abel Balbo|DC|82|1990"] },
  { c: 'BRA', y: 1998, f: '4-4-2', p: [
    "Taffarel", "Cafu", "Aldair", "Júnior Baiano|DFC|78|1998", "Roberto Carlos", "César Sampaio|MCD|80|1998", "Dunga",
    "Leonardo|MC|84|1994", "Rivaldo", "Bebeto", "Ronaldo", "Denílson|EI|82|1998"] },
  { c: 'NED', y: 1998, f: '4-3-3', p: [
    "Edwin van der Sar|POR|88|1998", "Michael Reiziger|LD|80|1998", "Jaap Stam|DFC|88|1998", "Frank de Boer|DFC|86|1994",
    "Arthur Numan|LI|80|1998", "Edgar Davids|MC|88|1998", "Phillip Cocu|MCD|84|1998", "Clarence Seedorf|MC|87|1994",
    "Ronald de Boer|ED|83|1994", "Dennis Bergkamp|DC|92|1990", "Patrick Kluivert|DC|87|1998", "Marc Overmars|EI|87|1994"] },
  { c: 'ARG', y: 1998, f: '4-4-2', p: [
    "Carlos Roa|POR|79|1998", "Javier Zanetti|LD|86|1998", "Roberto Ayala|DFC|85|1998", "Nelson Vivas|DFC|76|1998",
    "José Chamot", "Matías Almeyda|MCD|80|1998", "Diego Simeone", "Juan Sebastián Verón|MC|87|1998", "Ariel Ortega",
    "Marcelo Gallardo|MCO|80|1998", "Gabriel Batistuta", "Claudio López|DC|83|1998", "Hernán Crespo|DC|85|1998"] },
  { c: 'ING', y: 1998, f: '4-4-2', p: [
    "David Seaman|POR|85|1998", "Gary Neville|LD|81|1998", "Sol Campbell|DFC|84|1998", "Tony Adams|DFC|84|1998",
    "Graeme Le Saux|LI|79|1998", "David Beckham|MD|87|1998", "Paul Ince|MCD|82|1998", "Paul Scholes|MC|86|1998",
    "Darren Anderton|MI|79|1998", "Alan Shearer|DC|90|1998", "Michael Owen|DC|88|1998", "Teddy Sheringham|DC|81|1998"] },
  { c: 'GER', y: 2002, f: '3-5-2', p: [
    "Oliver Kahn|POR|92|1994", "Thomas Linke|DFC|78|2002", "Carsten Ramelow|DFC|78|2002", "Christoph Metzelder|DFC|80|2002",
    "Torsten Frings|MD|81|2002", "Dietmar Hamann|MCD|81|1998", "Michael Ballack|MCO|90|2002", "Bernd Schneider|MC|82|2002",
    "Marco Bode|MI|76|2002", "Miroslav Klose", "Oliver Neuville|DC|79|2002", "Carsten Jancker|DC|75|2002"] },
  { c: 'TUR', y: 2002, f: '4-4-2', p: [
    "Rüştü Reçber|POR|86|2002", "Fatih Akyel|LD|74|2002", "Alpay Özalan|DFC|82|2002", "Bülent Korkmaz|DFC|80|2002",
    "Hakan Ünsal|LI|76|2002", "Ümit Davala|MD|77|2002", "Tugay Kerimoğlu|MC|81|2002", "Emre Belözoğlu|MC|83|2002",
    "Yıldıray Baştürk|MCO|81|2002", "Hasan Şaş|EI|83|2002", "Hakan Şükür|DC|85|2002", "İlhan Mansız|DC|81|2002"] },
  { c: 'USA', y: 2002, f: '4-4-2', p: [
    "Brad Friedel|POR|82|1994", "Tony Sanneh|LD|75|2002", "Eddie Pope|DFC|77|1998", "Jeff Agoos|DFC|73|1998",
    "Frankie Hejduk|LI|74|1998", "John O'Brien|MC|77|2002", "Pablo Mastroeni|MCD|73|2002", "Claudio Reyna|MC|81|1994",
    "DaMarcus Beasley|EI|77|2002", "Landon Donovan|MCO|82|2002", "Brian McBride|DC|78|1998", "Clint Mathis|DC|74|2002"] },
  { c: 'FRA', y: 2006, f: '4-2-3-1', p: [
    "Fabien Barthez", "Willy Sagnol|LD|81|2002", "Lilian Thuram", "William Gallas|DFC|84|2002", "Éric Abidal|LI|80|2006",
    "Claude Makélélé|MCD|87|2002", "Patrick Vieira|MCD|88|1998", "Franck Ribéry|MD|85|2006", "Zinedine Zidane",
    "Florent Malouda|MI|81|2006", "Thierry Henry", "David Trezeguet"] },
  { c: 'GER', y: 2006, f: '4-4-2', p: [
    "Jens Lehmann|POR|84|1998", "Arne Friedrich|LD|77|2006", "Per Mertesacker|DFC|81|2006", "Christoph Metzelder", "Philipp Lahm",
    "Bernd Schneider", "Torsten Frings", "Michael Ballack", "Bastian Schweinsteiger", "Tim Borowski|MC|76|2006",
    "Miroslav Klose", "Lukas Podolski|DC|84|2006"] },
  { c: 'POR', y: 2006, f: '4-2-3-1', p: [
    "Ricardo|POR|80|2002", "Miguel|LD|79|2006", "Ricardo Carvalho|DFC|86|2006", "Fernando Meira|DFC|78|2002",
    "Nuno Valente|LI|76|2006", "Costinha|MCD|78|2006", "Maniche|MCD|81|2006", "Luís Figo|MD|91|2002", "Deco|MCO|87|2006",
    "Cristiano Ronaldo|MI|94|2006", "Pauleta|DC|82|2002", "Simão|EI|81|2006"] },
  { c: 'ARG', y: 2006, f: '4-4-2', p: [
    "Roberto Abbondanzieri|POR|80|2006", "Lionel Scaloni|LD|76|2006", "Roberto Ayala", "Gabriel Heinze|DFC|81|2006",
    "Juan Pablo Sorín|LI|80|2002", "Maxi Rodríguez|MD|81|2006", "Javier Mascherano|MCD|86|2006", "Esteban Cambiasso|MC|83|2006",
    "Juan Román Riquelme|MCO|89|2006", "Hernán Crespo", "Carlos Tevez|DC|85|2006", "Lionel Messi", "Javier Saviola|DC|81|2006"] },
  { c: 'BRA', y: 2006, f: '4-4-2', p: [
    "Dida|POR|83|2006", "Cafu", "Lúcio", "Juan|DFC|81|2006", "Roberto Carlos", "Emerson|MCD|80|2002", "Zé Roberto|MC|82|2006",
    "Kaká|MCO|91|2002", "Ronaldinho", "Ronaldo", "Adriano|DC|86|2006", "Robinho|EI|82|2006"] },
  { c: 'NED', y: 2010, f: '4-2-3-1', p: [
    "Maarten Stekelenburg|POR|80|2010", "Gregory van der Wiel|LD|78|2010", "John Heitinga|DFC|78|2010", "Joris Mathijsen|DFC|78|2006",
    "Giovanni van Bronckhorst|LI|80|1998", "Mark van Bommel|MCD|82|2006", "Nigel de Jong|MCD|81|2010", "Arjen Robben|MD|90|2006",
    "Wesley Sneijder|MCO|89|2006", "Dirk Kuyt|MI|81|2006", "Robin van Persie|DC|87|2006", "Rafael van der Vaart|MCO|82|2006"] },
  { c: 'GER', y: 2010, f: '4-2-3-1', p: [
    "Manuel Neuer", "Philipp Lahm", "Per Mertesacker", "Arne Friedrich", "Jérôme Boateng", "Bastian Schweinsteiger",
    "Sami Khedira|MCD|84|2010", "Thomas Müller", "Mesut Özil", "Lukas Podolski", "Miroslav Klose", "Toni Kroos"] },
  { c: 'ARG', y: 2010, f: '4-4-2', p: [
    "Sergio Romero|POR|79|2010", "Nicolás Otamendi", "Martín Demichelis|DFC|79|2010", "Walter Samuel|DFC|82|2002",
    "Gabriel Heinze", "Maxi Rodríguez", "Javier Mascherano", "Juan Sebastián Verón", "Ángel Di María", "Lionel Messi",
    "Gonzalo Higuaín|DC|86|2010", "Carlos Tevez", "Sergio Agüero|DC|87|2010"] },
  { c: 'BRA', y: 2010, f: '4-2-3-1', p: [
    "Júlio César Soares|POR|86|2006", "Maicon|LD|86|2006", "Lúcio", "Juan", "Michel Bastos|LI|77|2010", "Gilberto Silva",
    "Felipe Melo|MCD|78|2010", "Daniel Alves|MD|87|2006", "Kaká", "Robinho", "Elano|MC|78|2006", "Luís Fabiano|DC|83|2010"] },
  { c: 'GHA', y: 2010, f: '4-2-3-1', p: [
    "Richard Kingson|POR|76|2006", "John Paintsil|LD|74|2006", "John Mensah|DFC|78|2006", "Isaac Vorsah|DFC|73|2010",
    "Hans Sarpei|LI|72|2006", "Anthony Annan|MCD|75|2010", "Kevin-Prince Boateng|MCD|80|2010", "Kwadwo Asamoah|MCO|80|2010",
    "Sulley Muntari|MD|79|2006", "André Ayew|MI|79|2010", "Asamoah Gyan|DC|82|2006"] },
  { c: 'ARG', y: 2014, f: '4-3-3', p: [
    "Sergio Romero", "Pablo Zabaleta|LD|81|2014", "Martín Demichelis", "Ezequiel Garay|DFC|80|2014", "Marcos Rojo|LI|78|2014",
    "Javier Mascherano", "Lucas Biglia|MC|79|2014", "Enzo Pérez|MC|77|2014", "Ángel Di María", "Lionel Messi",
    "Gonzalo Higuaín", "Sergio Agüero", "Ezequiel Lavezzi|EI|80|2014"] },
  { c: 'NED', y: 2014, f: '3-5-2', p: [
    "Jasper Cillessen|POR|79|2014", "Stefan de Vrij|DFC|81|2014", "Ron Vlaar|DFC|79|2014", "Bruno Martins Indi|DFC|76|2014",
    "Daryl Janmaat|MD|77|2014", "Nigel de Jong", "Georginio Wijnaldum|MC|80|2014", "Wesley Sneijder", "Daley Blind|MI|80|2014",
    "Arjen Robben", "Robin van Persie", "Memphis Depay|DC|79|2014"] },
  { c: 'BRA', y: 2014, f: '4-2-3-1', p: [
    "Júlio César Soares", "Daniel Alves", "Thiago Silva|DFC|88|2010", "David Luiz|DFC|84|2014", "Marcelo|LI|85|2014",
    "Luiz Gustavo|MCD|80|2014", "Paulinho|MCD|80|2014", "Hulk|MD|81|2014", "Oscar Emboaba|MCO|81|2014", "Neymar|MI|91|2014",
    "Fred|DC|77|2014", "Willian|MD|81|2014"] },
  { c: 'COL', y: 2014, f: '4-2-3-1', p: [
    "David Ospina|POR|81|2014", "Juan Camilo Zúñiga|LD|79|2014", "Cristián Zapata|DFC|78|2014", "Mario Yepes|DFC|79|2014",
    "Pablo Armero|LI|76|2014", "Carlos Sánchez|MCD|77|2014", "Abel Aguilar|MCD|76|2014", "Juan Cuadrado|MD|84|2014",
    "James Rodríguez|MCO|88|2014", "Víctor Ibarbo|MI|75|2014", "Teófilo Gutiérrez|DC|79|2014", "Jackson Martínez|DC|81|2014"] },
  { c: 'CHI', y: 2014, f: '3-5-2', p: [
    "Claudio Bravo|POR|84|2010", "Gary Medel|DFC|81|2010", "Gonzalo Jara|DFC|76|2010", "Francisco Silva|DFC|74|2014",
    "Mauricio Isla|MD|78|2010", "Marcelo Díaz|MC|78|2014", "Jorge Valdivia|MCO|79|2010", "Arturo Vidal|MC|87|2010",
    "Eugenio Mena|MI|75|2014", "Charles Aránguiz|MC|81|2014", "Alexis Sánchez|DC|87|2010", "Eduardo Vargas|DC|80|2014"] },
  { c: 'BEL', y: 2018, f: '3-5-2', p: [
    "Thibaut Courtois|POR|89|2014", "Toby Alderweireld|DFC|85|2014", "Vincent Kompany|DFC|85|2014", "Jan Vertonghen|DFC|84|2014",
    "Thomas Meunier|MD|79|2018", "Axel Witsel|MCD|82|2014", "Kevin De Bruyne|MC|92|2014", "Yannick Carrasco|MI|81|2018",
    "Eden Hazard|MCO|92|2014", "Romelu Lukaku|DC|87|2014", "Dries Mertens|DC|84|2014", "Marouane Fellaini|MC|79|2014"] },
  { c: 'ING', y: 2018, f: '3-5-2', p: [
    "Jordan Pickford", "Kyle Walker|DFC|83|2018", "John Stones", "Harry Maguire|DFC|81|2018", "Kieran Trippier|MD|80|2018",
    "Jordan Henderson|MCD|81|2014", "Jesse Lingard|MC|77|2018", "Dele Alli|MC|80|2018", "Ashley Young|MI|76|2018",
    "Raheem Sterling|DC|85|2014", "Harry Kane", "Marcus Rashford|DC|80|2018"] },
  { c: 'BRA', y: 2018, f: '4-3-3', p: [
    "Alisson|POR|88|2018", "Fagner|LD|74|2018", "Thiago Silva", "Miranda|DFC|80|2018", "Marcelo", "Casemiro|MCD|86|2018",
    "Paulinho", "Philippe Coutinho|MC|86|2014", "Willian", "Gabriel Jesus|DC|82|2018", "Neymar", "Roberto Firmino|DC|83|2018"] },
  { c: 'URU', y: 2018, f: '4-4-2', p: [
    "Fernando Muslera", "Martín Cáceres|LD|78|2010", "José María Giménez|DFC|83|2014", "Diego Godín", "Diego Laxalt|LI|74|2018",
    "Nahitan Nández|MD|77|2018", "Lucas Torreira|MCD|80|2018", "Matías Vecino|MC|79|2018", "Rodrigo Bentancur|MI|80|2018",
    "Luis Suárez", "Edinson Cavani"] },
  { c: 'POR', y: 2018, f: '4-4-2', p: [
    "Rui Patrício|POR|84|2014", "Cédric Soares|LD|76|2018", "Pepe|DFC|85|2010", "José Fonte|DFC|78|2018",
    "Raphaël Guerreiro|LI|80|2018", "Bernardo Silva|MD|86|2018", "William Carvalho|MCD|80|2014", "João Moutinho|MC|82|2010",
    "João Mário|MI|78|2018", "Cristiano Ronaldo", "Gonçalo Guedes|DC|77|2018", "Ricardo Quaresma|ED|79|2018"] },
  { c: 'RUS', y: 2018, f: '4-2-3-1', p: [
    "Igor Akinfeev|POR|82|2014", "Mário Fernandes|LD|78|2018", "Sergei Ignashevich|DFC|76|2014", "Ilya Kutepov|DFC|75|2018",
    "Yuri Zhirkov|LI|75|2014", "Roman Zobnin|MCD|76|2018", "Daler Kuzyaev|MCD|74|2018", "Aleksandr Samedov|MD|73|2014",
    "Aleksandr Golovin|MCO|80|2018", "Denis Cheryshev|MI|78|2018", "Artem Dzyuba|DC|79|2018"] },
  { c: 'BRA', y: 2022, f: '4-2-3-1', p: [
    "Alisson", "Danilo|LD|80|2022", "Marquinhos|DFC|86|2018", "Thiago Silva", "Éder Militão|DFC|84|2022", "Casemiro",
    "Lucas Paquetá|MCD|83|2022", "Raphinha|MD|84|2022", "Neymar", "Vinícius Júnior|MI|89|2022", "Richarlison|DC|83|2018",
    "Rodrygo|DC|83|2022", "Antony|ED|78|2022", "Bruno Guimarães|MC|84|2022"] },
  { c: 'FRA', y: 2022, f: '4-2-3-1', p: [
    "Hugo Lloris", "Jules Koundé|LD|84|2022", "Raphaël Varane", "Dayot Upamecano|DFC|82|2022", "Théo Hernández|LI|84|2022",
    "Aurélien Tchouaméni|MCD|84|2022", "Adrien Rabiot|MCD|82|2022", "Ousmane Dembélé|MD|85|2018", "Antoine Griezmann",
    "Kylian Mbappé", "Olivier Giroud", "Randal Kolo Muani|DC|79|2022", "Eduardo Camavinga|MC|81|2022"] },
  { c: 'CRO', y: 2022, f: '4-3-3', p: [
    "Dominik Livaković|POR|83|2018", "Josip Juranović|LD|77|2022", "Dejan Lovren", "Joško Gvardiol|DFC|85|2022",
    "Borna Sosa|LI|78|2022", "Marcelo Brozović", "Luka Modrić", "Mateo Kovačić|MC|85|2014", "Ivan Perišić",
    "Andrej Kramarić|DC|81|2018", "Mario Pašalić|ED|78|2022", "Bruno Petković|DC|76|2022"] },
  { c: 'ING', y: 2022, f: '4-3-3', p: [
    "Jordan Pickford", "Kyle Walker", "John Stones", "Harry Maguire", "Luke Shaw", "Declan Rice", "Jude Bellingham",
    "Jordan Henderson", "Bukayo Saka", "Harry Kane", "Phil Foden", "Marcus Rashford", "Raheem Sterling"] },
  { c: 'POR', y: 2022, f: '4-3-3', p: [
    "Diogo Costa|POR|82|2022", "João Cancelo|LD|85|2022", "Pepe", "Rúben Dias|DFC|87|2022", "Raphaël Guerreiro",
    "Rúben Neves|MCD|81|2022", "Bruno Fernandes|MC|87|2018", "Bernardo Silva", "João Félix|ED|82|2022",
    "Gonçalo Ramos|DC|79|2022", "Cristiano Ronaldo", "Rafael Leão|EI|85|2022"] },
  { c: 'NED', y: 2022, f: '3-5-2', p: [
    "Andries Noppert|POR|74|2022", "Jurriën Timber|DFC|79|2022", "Virgil van Dijk|DFC|89|2022", "Nathan Aké|DFC|81|2022",
    "Denzel Dumfries|MD|81|2022", "Frenkie de Jong|MC|87|2022", "Cody Gakpo|MCO|83|2022", "Teun Koopmeiners|MC|80|2022",
    "Daley Blind", "Memphis Depay", "Steven Bergwijn|DC|77|2022", "Wout Weghorst|DC|75|2022"] },
  { c: 'ESP', y: 2022, f: '4-3-3', p: [
    "Unai Simón", "Dani Carvajal|LD|84|2018", "Rodri", "Aymeric Laporte|DFC|83|2022", "Jordi Alba|LI|83|2014",
    "Sergio Busquets", "Pedri", "Gavi|MC|82|2022", "Ferran Torres|ED|79|2022", "Álvaro Morata|DC|80|2018",
    "Dani Olmo|EI|83|2022", "Marco Asensio|ED|80|2018"] },
  { c: 'GER', y: 2022, f: '4-2-3-1', p: [
    "Manuel Neuer", "Niklas Süle|DFC|80|2018", "Antonio Rüdiger|DFC|85|2018", "Nico Schlotterbeck|DFC|78|2022",
    "David Raum|LI|77|2022", "Joshua Kimmich|MCD|88|2018", "İlkay Gündoğan|MCD|85|2022", "Serge Gnabry|MD|82|2022",
    "Jamal Musiala|MCO|87|2022", "Leroy Sané|MI|84|2022", "Thomas Müller", "Kai Havertz|DC|82|2022", "Niclas Füllkrug|DC|78|2022"] },
  { c: 'JPN', y: 2022, f: '3-5-2', p: [
    "Shūichi Gonda|POR|74|2018", "Ko Itakura|DFC|77|2022", "Maya Yoshida|DFC|76|2014", "Takehiro Tomiyasu|DFC|79|2022",
    "Junya Itō|MD|79|2022", "Wataru Endō|MC|80|2018", "Daichi Kamada|MCO|80|2022", "Hidemasa Morita|MC|77|2022",
    "Kaoru Mitoma|MI|81|2022", "Ritsu Dōan|DC|78|2022", "Takuma Asano|DC|74|2022", "Hiroki Sakai|LD|76|2018"] },
  { c: 'USA', y: 2022, f: '4-3-3', p: [
    "Matt Turner|POR|75|2022", "Sergiño Dest|LD|77|2022", "Walker Zimmerman|DFC|75|2022", "Tim Ream|DFC|74|2022",
    "Antonee Robinson|LI|78|2022", "Weston McKennie|MC|79|2022", "Tyler Adams|MCD|79|2022", "Yunus Musah|MC|77|2022",
    "Christian Pulisic|ED|83|2022", "Josh Sargent|DC|73|2022", "Timothy Weah|EI|76|2022", "Gio Reyna|MCO|77|2022"] },
  { c: 'MEX', y: 2022, f: '4-3-3', p: [
    "Guillermo Ochoa|POR|82|2014", "Jorge Sánchez|LD|73|2022", "César Montes|DFC|76|2022", "Héctor Moreno|DFC|76|2014",
    "Jesús Gallardo|LI|74|2022", "Héctor Herrera|MC|78|2014", "Edson Álvarez|MCD|80|2022", "Andrés Guardado|MC|78|2010",
    "Hirving Lozano|ED|81|2018", "Henry Martín|DC|74|2022", "Alexis Vega|EI|76|2022", "Raúl Jiménez|DC|78|2018"] },
  // ---------- Todos los equipos de los Mundiales 1958 – 2026 ----------
  { c: 'FRG', y: 1958, f: '4-2-4', p: [
    "Fritz Herkenrath|POR|77|1958", "Georg Stollenwerk|LD|75|1958", "Herbert Erhardt|DFC|79|1954", "Erich Juskowiak|LI|76|1958",
    "Horst Eckel|MC|78|1954", "Horst Szymaniak|MC|81|1958", "Karl-Heinz Schnellinger", "Helmut Rahn|ED|86|1954",
    "Fritz Walter|MCO|88|1954", "Uwe Seeler", "Hans Schäfer|EI|82|1954", "Alfred Kelbassa|DC|74|1958"] },
  { c: 'ARG', y: 1958, f: '4-2-4', p: [
    "Amadeo Carrizo|POR|82|1958", "Francisco Lombardo|LD|73|1958", "Pedro Dellacha|DFC|76|1958", "Federico Vairo|LI|74|1958",
    "Néstor Rossi|MCD|82|1958", "José Varacka|MC|75|1958", "Ludovico Avio|MC|74|1958", "Omar Corbatta|ED|81|1958",
    "Ángel Labruna|MCO|82|1958", "Norberto Menéndez|DC|76|1958", "Osvaldo Cruz|EI|74|1958"] },
  { c: 'NIR', y: 1958, f: '4-2-4', p: [
    "Harry Gregg|POR|84|1958", "Dick Keith|LD|72|1958", "Willie Cunningham|DFC|72|1958", "Alf McMichael|LI|72|1958",
    "Danny Blanchflower|MC|85|1958", "Bertie Peacock|MC|74|1958", "Tommy Casey|MCD|70|1958", "Billy Bingham|ED|77|1958",
    "Wilbur Cush|MCO|74|1958", "Jimmy McIlroy|MCO|82|1958", "Peter McParland|EI|79|1958", "Derek Dougan|DC|74|1958"] },
  { c: 'TCH', y: 1958, f: '4-2-4', p: [
    "Břetislav Dolejší|POR|76|1958", "Jiří Čadek|LD|74|1958", "Ján Popluhár", "Svatopluk Pluskal",
    "Ladislav Novák", "Titus Buberník|MC|74|1958", "Josef Masopust", "Václav Hovorka|ED|73|1958",
    "Milan Dvořák|MCO|76|1958", "Zdeněk Zikán|DC|75|1958", "Jiří Feureisl|DC|72|1958"] },
  { c: 'ING', y: 1958, f: '4-2-4', p: [
    "Colin McDonald|POR|78|1958", "Don Howe|LD|76|1958", "Billy Wright|DFC|85|1950", "Tommy Banks|LI|72|1958",
    "Eddie Clamp|MCD|72|1958", "Bill Slater|MC|74|1954", "Bobby Robson|MC|77|1958", "Bryan Douglas|ED|76|1958",
    "Johnny Haynes|MCO|84|1954", "Derek Kevan|DC|75|1958", "Alan A'Court|EI|72|1958", "Tom Finney|ED|88|1950",
    "Bobby Charlton"] },
  { c: 'URS', y: 1958, f: '4-2-4', p: [
    "Lev Yashin|POR|94|1958", "Vladimir Kesarev|LD|74|1958", "Konstantin Krizhevsky|DFC|75|1958", "Boris Kuznetsov|LI|74|1958",
    "Yuri Voinov|MC|77|1958", "Igor Netto|MC|84|1958", "Viktor Tsarev|MCD|74|1958", "Aleksandr Ivanov|ED|76|1958",
    "Valentin Ivanov|MCO|82|1958", "Nikita Simonyan|DC|79|1958", "Anatoli Ilyin|EI|76|1958"] },
  { c: 'AUT', y: 1958, f: '4-2-4', p: [
    "Rudolf Szanwald|POR|74|1958", "Paul Halla|LD|72|1958", "Ernst Happel|DFC|82|1954", "Franz Swoboda|LI|72|1958",
    "Karl Koller|MCD|78|1954", "Gerhard Hanappi|MC|82|1954", "Walter Horak|ED|72|1958", "Helmut Senekowitsch|MCO|72|1958",
    "Hans Buzek|DC|74|1958", "Alfred Körner|EI|76|1954", "Paul Kozlicek|MC|71|1958"] },
  { c: 'HUN', y: 1958, f: '4-2-4', p: [
    "Gyula Grosics|POR|86|1954", "Sándor Mátrai|LD|76|1958", "Ferenc Sipos|DFC|77|1958", "László Sárosi|LI|72|1958",
    "József Bozsik|MC|87|1954", "Dezső Bundzsák|MC|74|1958", "Károly Sándor|ED|77|1958", "Nándor Hidegkuti|MCO|86|1954",
    "Lajos Tichy|DC|82|1958", "Máté Fenyvesi|EI|75|1958", "Pál Berendy|MCD|71|1958"] },
  { c: 'MEX', y: 1958, f: '4-2-4', p: [
    "Antonio Carbajal|POR|77|1950", "Jesús del Muro|LD|70|1958", "José Villegas|LI|71|1958", "Alfonso Portugal|DFC|69|1958",
    "Guillermo Sepúlveda|DFC|70|1958", "Raúl Cárdenas|MC|72|1958", "Jaime Belmonte|ED|71|1958", "Salvador Reyes|DC|73|1958",
    "Carlos Blanco|DC|70|1958", "Carlos Calderón de la Barca|MCO|70|1958", "Enrique Sesma|EI|70|1958"] },
  { c: 'PAR', y: 1958, f: '4-2-4', p: [
    "Samuel Aguilar|POR|68|1958", "Edelmiro Arévalo|LD|67|1958", "Juan Vicente Lezcano|DFC|70|1958", "Eligio Echagüe|LI|66|1958",
    "Ignacio Achúcarro|MC|69|1958", "Salvador Villalba|MC|67|1958", "Juan Bautista Agüero|ED|72|1958", "José Parodi|DC|73|1958",
    "Jorge Lino Romero|DC|72|1958", "Cayetano Ré|MCO|74|1958", "Florencio Amarilla|EI|72|1958"] },
  { c: 'SCO', y: 1958, f: '4-2-4', p: [
    "Tommy Younger|POR|72|1958", "Bill Brown|POR|74|1958", "John Hewie|LD|72|1958", "Bobby Evans|DFC|76|1958",
    "Eric Caldow|LI|74|1958", "Tommy Docherty|MCD|75|1954", "Eddie Turnbull|MC|74|1958", "Dave Mackay|MC|80|1958",
    "Graham Leggat|ED|72|1958", "Bobby Collins|MCO|76|1958", "Jimmy Murray|DC|72|1958", "Jackie Mudie|DC|72|1958",
    "Stewart Imlach|EI|72|1958"] },
  { c: 'WAL', y: 1958, f: '4-2-4', p: [
    "Jack Kelsey|POR|80|1958", "Stuart Williams|LD|72|1958", "Mel Charles|DFC|74|1958", "Mel Hopkins|LI|72|1958",
    "Dave Bowen|MC|72|1958", "Derrick Sullivan|MC|70|1958", "Terry Medwin|ED|72|1958", "Ivor Allchurch|MCO|82|1958",
    "John Charles|DC|90|1958", "Cliff Jones|EI|80|1958", "Ron Hewitt|MC|70|1958", "Colin Webster|DC|70|1958"] },
  { c: 'YUG', y: 1958, f: '4-2-4', p: [
    "Vladimir Beara|POR|84|1950", "Novak Tomić|LD|72|1958", "Branko Zebec|DFC|82|1954", "Tomislav Crnković|LI|76|1954",
    "Dobrosav Krstić|MCD|74|1958", "Vujadin Boškov|MC|78|1954", "Aleksandar Petaković|ED|75|1958", "Dragoslav Šekularac|MCO|84|1958",
    "Todor Veselinović|DC|78|1958", "Milan Milutinović|DC|77|1958", "Zdravko Rajkov|EI|74|1958"] },
  { c: 'YUG', y: 1962, f: '4-2-4', p: [
    "Milutin Šoškić|POR|82|1962", "Vladimir Durković|LD|76|1962", "Vlatko Marković|DFC|76|1962", "Fahrudin Jusufi|LI|78|1962",
    "Petar Radaković|MCD|75|1962", "Vladimir Popović|MC|75|1962", "Dragoslav Šekularac", "Andrija Anković|MC|74|1962",
    "Dražan Jerković|DC|82|1962", "Milan Galić|DC|81|1962", "Josip Skoblar|EI|76|1962"] },
  { c: 'HUN', y: 1962, f: '4-2-4', p: [
    "Gyula Grosics", "Sándor Mátrai", "Kálmán Mészöly|DFC|80|1962", "Ferenc Sipos",
    "László Sárosi", "Ernő Solymosi|MC|76|1962", "Gyula Rákosi|MC|76|1962", "Károly Sándor",
    "János Göröcs|MCO|80|1962", "Flórián Albert|DC|87|1962", "Lajos Tichy", "Máté Fenyvesi"] },
  { c: 'URS', y: 1962, f: '4-2-4', p: [
    "Lev Yashin", "Eduard Dubinski|LD|76|1962", "Albert Shesternyov|DFC|82|1962", "Anatoli Maslyonkin|DFC|76|1958",
    "Leonid Ostrovski|LI|74|1962", "Igor Netto", "Valeri Voronin|MC|82|1962", "Valentin Ivanov",
    "Igor Chislenko|ED|80|1962", "Viktor Ponedelnik|DC|80|1962", "Mikheil Meskhi|EI|82|1962"] },
  { c: 'FRG', y: 1962, f: '4-2-4', p: [
    "Wolfgang Fahrian|POR|76|1962", "Hans Nowak|LD|76|1962", "Herbert Erhardt", "Willi Schulz",
    "Leo Wilden|DFC|75|1962", "Karl-Heinz Schnellinger", "Horst Szymaniak", "Hans Schäfer",
    "Helmut Haller", "Albert Brülls|ED|79|1962", "Uwe Seeler"] },
  { c: 'ING', y: 1962, f: '4-2-4', p: [
    "Ron Springett|POR|78|1962", "Jimmy Armfield|LD|81|1962", "Maurice Norman|DFC|76|1962", "Bobby Moore",
    "Ray Wilson", "Ron Flowers|MC|76|1962", "Johnny Haynes", "Bryan Douglas",
    "Jimmy Greaves", "Gerry Hitchens|DC|77|1962", "Bobby Charlton", "Alan Peacock|DC|74|1962",
    "Roger Hunt"] },
  { c: 'ITA', y: 1962, f: '4-3-3', p: [
    "Lorenzo Buffon|POR|77|1962", "Enrico Albertosi", "Francesco Janich|DFC|74|1962", "Cesare Maldini|DFC|80|1962",
    "Sandro Salvadore|DFC|77|1962", "Giovanni Trapattoni|MCD|78|1962", "Giacomo Bulgarelli|MC|78|1962", "Gianni Rivera",
    "Humberto Maschio|MCO|80|1962", "Bruno Mora|ED|76|1962", "Omar Sívori|DC|89|1962", "José Altafini",
    "Giampaolo Menichelli|EI|75|1962"] },
  { c: 'ARG', y: 1962, f: '4-2-4', p: [
    "Antonio Roma|POR|78|1962", "Rubén Navarro|LD|74|1962", "José Ramos Delgado|DFC|78|1962", "Silvio Marzolini|LI|82|1962",
    "Federico Sacchi|MC|74|1962", "Antonio Rattín|MCD|82|1962", "Vladislao Cap|MC|72|1962", "Héctor Facundo|ED|74|1962",
    "Rubén Héctor Sosa|DC|76|1962", "José Sanfilippo|DC|80|1962", "Marcelo Pagani|DC|74|1962", "Raúl Belén|EI|74|1962"] },
  { c: 'ESP', y: 1962, f: '4-2-4', p: [
    "Carmelo Cedrún|POR|74|1962", "Feliciano Rivilla|LD|76|1962", "Jesús Garay|DFC|78|1962", "Severino Reija|LI|74|1962",
    "Joan Segarra|MCD|76|1962", "Martí Vergés|MC|74|1962", "Luis Suárez Miramontes|MCO|90|1962", "Luis del Sol|MC|80|1962",
    "Joaquín Peiró|DC|80|1962", "Ferenc Puskás|DC|94|1954", "Francisco Gento|EI|88|1962", "Enrique Collar|ED|78|1962",
    "Alfredo Di Stéfano|DC|95|1962"] },
  { c: 'MEX', y: 1962, f: '4-2-4', p: [
    "Antonio Carbajal", "Jesús del Muro", "Raúl Cárdenas", "Guillermo Sepúlveda",
    "Ignacio Jáuregui|LI|72|1962", "Pedro Nájera|MCD|72|1962", "Alfredo del Águila|MC|72|1962", "Salvador Reyes",
    "Héctor Hernández|DC|73|1962", "Alfredo Hernández|MCO|71|1962", "Isidoro Díaz|EI|72|1962"] },
  { c: 'URU', y: 1962, f: '4-2-4', p: [
    "Roberto Sosa|POR|74|1962", "Horacio Troche|DFC|77|1962", "Emilio Álvarez|LD|72|1962", "Mario Méndez|LI|71|1962",
    "Néstor Gonçalves|MCD|76|1962", "Eliseo Álvarez|MC|72|1962", "Luis Cubilla|ED|80|1962", "Pedro Rocha|MCO|80|1962",
    "José Sasía|DC|76|1962", "Ángel Cabrera|DC|73|1962", "Domingo Pérez|EI|74|1962"] },
  { c: 'SUI', y: 1962, f: '4-3-3', p: [
    "Karl Elsener|POR|72|1962", "André Grobéty|LD|70|1962", "Heinz Schneiter|DFC|72|1962", "Fritz Morf|DFC|69|1962",
    "Ely Tacchella|LI|72|1962", "Hans Weber|MCD|70|1954", "Roger Vonlanthen|MC|73|1954", "Norbert Eschmann|MC|72|1962",
    "Charles Antenen|ED|74|1954", "Rolf Wüthrich|DC|72|1962", "Anton Allemann|EI|73|1962"] },
  { c: 'COL', y: 1962, f: '4-2-4', p: [
    "Efraín Sánchez|POR|72|1962", "Francisco Zuluaga|DFC|70|1962", "Aníbal Alzate|LD|66|1962", "Héctor Echeverri|LI|66|1962",
    "Óscar López|MCD|66|1962", "Jaime González|MC|67|1962", "Rolando Serrano|MC|66|1962", "Germán Aceros|ED|70|1962",
    "Marcos Coll|EI|72|1962", "Antonio Rada|DC|71|1962", "Marino Klinger|DC|72|1962", "Delio Gamboa|MCO|70|1962"] },
  { c: 'BUL', y: 1962, f: '4-2-4', p: [
    "Georgi Naydenov|POR|72|1962", "Kiril Rakarov|LD|68|1962", "Ivan Dimitrov|DFC|70|1962", "Stoyan Kitov|DFC|67|1962",
    "Boris Gaganelov|LI|70|1962", "Dimitar Yakimov|MC|74|1962", "Georgi Sokolov|MCO|71|1962", "Todor Diev|ED|70|1962",
    "Georgi Asparuhov|DC|80|1962", "Nikola Kotkov|DC|72|1962", "Ivan Kolev|EI|76|1962", "Hristo Iliev|MC|69|1962"] },
  { c: 'URS', y: 1966, f: '4-2-4', p: [
    "Lev Yashin", "Anzor Kavazashvili|POR|74|1966", "Vladimir Ponomaryov|LD|74|1966", "Albert Shesternyov",
    "Murtaz Khurtsilava|DFC|79|1966", "Vasili Danilov|LI|74|1966", "Valeri Voronin", "Iosif Sabo|MC|76|1966",
    "Igor Chislenko", "Anatoliy Banishevskiy|DC|78|1966", "Eduard Malofeyev|DC|76|1966", "Valery Porkujan|EI|77|1966"] },
  { c: 'ARG', y: 1966, f: '4-3-3', p: [
    "Antonio Roma", "Roberto Ferreiro|LD|74|1966", "Roberto Perfumo|DFC|82|1966", "Rafael Albrecht|DFC|78|1966",
    "Silvio Marzolini", "Antonio Rattín", "Jorge Solari|MC|76|1966", "Alberto González|MC|76|1962",
    "Ermindo Onega|MCO|82|1966", "Luis Artime|DC|82|1966", "Oscar Más|EI|80|1966"] },
  { c: 'HUN', y: 1966, f: '4-2-4', p: [
    "József Gelei|POR|74|1962", "Benő Káposzta|LD|74|1966", "Kálmán Mészöly", "Sándor Mátrai",
    "Ferenc Sipos", "Gusztáv Szepesi|LI|73|1966", "Imre Mathesz|MC|74|1966", "Gyula Rákosi",
    "Ferenc Bene|ED|84|1966", "Flórián Albert", "János Farkas|DC|80|1966"] },
  { c: 'ITA', y: 1966, f: '4-3-3', p: [
    "Enrico Albertosi", "Tarcisio Burgnich", "Aristide Guarneri|DFC|78|1966", "Roberto Rosato",
    "Giacinto Facchetti", "Sandro Salvadore", "Giovanni Lodetti|MC|74|1966", "Romano Fogli|MCD|75|1966",
    "Giacomo Bulgarelli", "Gianni Rivera", "Sandro Mazzola", "Marino Perani|ED|73|1966",
    "Paolo Barison|EI|74|1966"] },
  { c: 'BRA', y: 1966, f: '4-2-4', p: [
    "Gilmar", "Djalma Santos", "Bellini", "Orlando",
    "Brito", "Paulo Henrique|LI|74|1966", "Denílson Machado|MCD|75|1966", "Lima|MC|76|1966",
    "Gérson", "Garrincha", "Jairzinho", "Pelé",
    "Tostão"] },
  { c: 'URU', y: 1966, f: '4-2-4', p: [
    "Ladislao Mazurkiewicz|POR|85|1966", "Pablo Forlán|LD|76|1966", "Horacio Troche", "Jorge Manicera|DFC|76|1966",
    "Luis Ubiña|LI|74|1966", "Néstor Gonçalves", "Omar Caetano|MC|76|1966", "Julio César Cortés|MC|75|1966",
    "Pedro Rocha", "Héctor Silva|DC|76|1966", "José Sasía", "Domingo Pérez",
    "Milton Viera|MC|74|1966"] },
  { c: 'ESP', y: 1966, f: '4-2-4', p: [
    "José Ángel Iribar|POR|85|1966", "Manuel Sanchís|LD|77|1966", "Francisco Gallego|DFC|76|1966", "Ignacio Zoco|DFC|78|1966",
    "Feliciano Rivilla", "Pirri|MC|80|1966", "Luis Suárez Miramontes", "Josep Maria Fusté|MC|77|1966",
    "Amancio|ED|85|1966", "Joaquín Peiró", "Marcelino|DC|78|1966", "Francisco Gento"] },
  { c: 'CHI', y: 1966, f: '4-4-2', p: [
    "Juan Olivares|POR|72|1966", "Luis Eyzaguirre", "Humberto Cruz|DFC|72|1966", "Elías Figueroa|DFC|85|1966",
    "Hugo Villanueva|LI|70|1966", "Ignacio Prieto|MC|73|1966", "Rubén Marcos|MC|74|1966", "Pedro Araya|ED|74|1966",
    "Alberto Fouilloux", "Armando Tobar|DC|72|1966", "Leonel Sánchez"] },
  { c: 'MEX', y: 1966, f: '4-2-4', p: [
    "Ignacio Calderón|POR|72|1966", "Antonio Carbajal", "Arturo Chaires|LD|70|1966", "Gustavo Peña|DFC|74|1966",
    "Guillermo Hernández|DFC|70|1966", "Ignacio Jáuregui", "Isidoro Díaz", "Salvador Reyes",
    "Aarón Padilla|ED|72|1966", "Enrique Borja|DC|76|1966", "Javier Fragoso|DC|72|1966"] },
  { c: 'FRA', y: 1966, f: '4-2-4', p: [
    "Marcel Aubour|POR|76|1966", "Jean Djorkaeff|LD|77|1966", "Robert Budzynski|DFC|74|1966", "Bernard Bosquier|DFC|78|1966",
    "Marcel Artelesa|LI|74|1966", "Joseph Bonnel|MC|76|1966", "Robert Herbin|MC|75|1966", "Jacky Simon|ED|74|1966",
    "Philippe Gondet|DC|76|1966", "Nestor Combin|DC|76|1966", "Gérard Hausser|EI|75|1966", "Héctor De Bourgoing|MCO|73|1966"] },
  { c: 'BUL', y: 1966, f: '4-2-4', p: [
    "Georgi Naydenov", "Aleksandar Shalamanov|LD|72|1966", "Dimitar Penev|DFC|74|1966", "Ivan Vutsov|DFC|70|1966",
    "Boris Gaganelov", "Dobromir Zhechev|MCD|72|1966", "Dimitar Yakimov", "Dinko Dermendzhiev|ED|72|1966",
    "Georgi Asparuhov", "Nikola Kotkov", "Ivan Kolev"] },
  { c: 'SUI', y: 1966, f: '4-3-3', p: [
    "Karl Elsener", "Leo Eichmann|POR|70|1966", "André Grobéty", "Heinz Schneiter",
    "Ely Tacchella", "Xavier Stierli|DFC|69|1966", "Richard Dürr|MC|72|1966", "Köbi Kuhn|MC|76|1966",
    "Karl Odermatt|MCO|74|1966", "René-Pierre Quentin|EI|72|1966", "Robert Hosp|DC|70|1966"] },
  { c: 'MEX', y: 1970, f: '4-4-2', p: [
    "Ignacio Calderón", "José Vantolrá|LD|70|1970", "Gustavo Peña", "Javier Guzmán|DFC|71|1970",
    "Mario Pérez|LI|70|1970", "Antonio Munguía|MCD|71|1970", "Héctor Pulido|MC|72|1970", "Isidoro Díaz",
    "Aarón Padilla", "Javier Valdivia|DC|73|1970", "Enrique Borja", "Javier Fragoso"] },
  { c: 'URS', y: 1970, f: '4-4-2', p: [
    "Anzor Kavazashvili", "Revaz Dzodzuashvili|LD|76|1970", "Albert Shesternyov", "Murtaz Khurtsilava",
    "Vladimir Kaplichny|DFC|77|1970", "Yevgeni Lovchev|LI|79|1970", "Viktor Serebryanikov|MC|76|1966", "Kakhi Asatiani|MC|78|1970",
    "Vladimir Muntyan|MC|81|1970", "Gennadi Yevryuzhikhin|ED|75|1970", "Anatoliy Byshovets|DC|84|1970", "Givi Nodia|EI|74|1970",
    "Vitaliy Khmelnitsky|DC|76|1970"] },
  { c: 'BEL', y: 1970, f: '4-3-3', p: [
    "Christian Piot|POR|80|1970", "Georges Heylens|LD|78|1970", "Léon Jeck|DFC|76|1970", "Nicolas Dewalque|DFC|76|1970",
    "Jean Thissen|LI|74|1970", "Wilfried Van Moer|MC|83|1970", "Odilon Polleunis|MC|76|1970", "Jan Verheyen|MC|75|1970",
    "Paul Van Himst|MCO|86|1970", "Raoul Lambert|DC|80|1970", "Wilfried Puis|EI|76|1970", "Johan Devrindt|DC|74|1970"] },
  { c: 'SLV', y: 1970, f: '4-4-2', p: [
    "Raúl Magaña|POR|64|1970", "Roberto Rivas|DFC|62|1970", "Salvador Mariona|DFC|64|1970", "Saturnino Osorio|LI|60|1970",
    "Jorge Vásquez|LD|60|1970", "José Quintanilla|MC|61|1970", "Salvador Cabezas|MC|62|1970", "Mauricio Manzano|MC|61|1970",
    "Mauricio Rodríguez|DC|65|1970", "Juan Ramón Martínez|DC|64|1970", "Ernesto Aparicio|DC|62|1970", "Elmer Acevedo|EI|61|1970"] },
  { c: 'URU', y: 1970, f: '4-3-3', p: [
    "Ladislao Mazurkiewicz", "Luis Ubiña", "Atilio Ancheta|DFC|80|1970", "Roberto Matosas|DFC|77|1970",
    "Juan Martín Mujica|LI|75|1970", "Julio Montero Castillo|MCD|78|1970", "Julio César Cortés", "Ildo Maneiro|MC|76|1970",
    "Pedro Rocha", "Luis Cubilla", "Víctor Espárrago|DC|78|1970", "Julio César Morales|EI|78|1970"] },
  { c: 'SUE', y: 1970, f: '4-4-2', p: [
    "Ronnie Hellström|POR|84|1970", "Hans Selander|LD|72|1970", "Björn Nordqvist|DFC|80|1970", "Kurt Axelsson|DFC|73|1970",
    "Roland Grip|LI|72|1970", "Bo Larsson|MC|80|1970", "Tommy Svensson|MCD|74|1970", "Ove Grahn|MC|76|1970",
    "Örjan Persson|MI|76|1970", "Ove Kindvall|DC|80|1970", "Tom Turesson|DC|74|1970", "Inge Ejderstedt|ED|73|1970"] },
  { c: 'ISR', y: 1970, f: '4-4-2', p: [
    "Itzhak Vissoker|POR|67|1970", "Shmuel Rosenthal|LD|65|1970", "Zvi Rosen|DFC|66|1970", "David Primo|DFC|65|1970",
    "Menachem Bello|LI|64|1970", "Rachamim Talbi|DFC|64|1970", "Itzhak Shum|MCD|65|1970", "Giora Spiegel|MC|70|1970",
    "Mordechai Spiegler|DC|74|1970", "George Borba|EI|65|1970", "Yehoshua Feigenbaum|DC|67|1970"] },
  { c: 'ROU', y: 1970, f: '4-4-2', p: [
    "Stere Adamache|POR|74|1970", "Lajos Sătmăreanu|LD|73|1970", "Nicolae Lupescu|DFC|75|1970", "Cornel Dinu|DFC|78|1970",
    "Mihai Mocanu|LI|72|1970", "Radu Nunweiller|MC|76|1970", "Ion Dumitru|MC|77|1970", "Emerich Dembrovschi|MC|76|1970",
    "Mircea Lucescu|EI|78|1970", "Florea Dumitrache|DC|79|1970", "Alexandru Neagu|DC|74|1970", "Necula Răducanu|POR|72|1970"] },
  { c: 'TCH', y: 1970, f: '4-4-2', p: [
    "Ivo Viktor|POR|84|1970", "Karol Dobiaš|LD|77|1970", "Alexander Horváth|DFC|76|1970", "Václav Migas|DFC|74|1970",
    "Vladimír Hagara|LI|73|1970", "Ladislav Kuna|MC|77|1970", "Andrej Kvašňák", "Karol Jokl|EI|76|1970",
    "František Veselý|ED|76|1970", "Ladislav Petráš|DC|78|1970", "Jozef Adamec|DC|79|1962"] },
  { c: 'BUL', y: 1970, f: '4-4-2', p: [
    "Simeon Simeonov|POR|74|1966", "Aleksandar Shalamanov", "Dimitar Penev", "Boris Gaganelov",
    "Dobromir Zhechev", "Dimitar Yakimov", "Hristo Bonev|MC|81|1970", "Asparuh Nikodimov|MC|73|1970",
    "Dinko Dermendzhiev", "Georgi Asparuhov", "Petar Zhekov|DC|79|1970"] },
  { c: 'MAR', y: 1970, f: '4-4-2', p: [
    "Allal Ben Kassou|POR|68|1970", "Abdallah Lamrani|LD|63|1970", "Kacem Slimani|DFC|64|1970", "Boujemaa Benkhrif|DFC|63|1970",
    "Moulay Idriss Khanoussi|LI|62|1970", "Driss Bamous|MC|66|1970", "Mohammed El Filali|MC|64|1970", "Said Ghandi|MC|63|1970",
    "Maouhoub Ghazouani|DC|65|1970", "Houmane Jarir|DC|66|1970", "Ahmed Faras|DC|70|1970"] },
  { c: 'GDR', y: 1974, f: '4-3-3', p: [
    "Jürgen Croy|POR|82|1974", "Gerd Kische|LD|74|1974", "Konrad Weise|DFC|77|1974", "Bernd Bransch|DFC|78|1974",
    "Siegmar Wätzlich|LI|73|1974", "Reinhard Lauck|MCD|75|1974", "Harald Irmscher|MC|74|1974", "Jürgen Sparwasser|MCO|79|1974",
    "Hans-Jürgen Kreische|DC|77|1974", "Joachim Streich|DC|78|1974", "Martin Hoffmann|EI|76|1974", "Eberhard Vogel|EI|74|1974"] },
  { c: 'CHI', y: 1974, f: '4-3-3', p: [
    "Leopoldo Vallejos|POR|73|1974", "Rolando García|LD|70|1974", "Alberto Quintano|DFC|74|1974", "Elías Figueroa",
    "Antonio Arias|LI|70|1974", "Guillermo Páez|MCD|70|1974", "Francisco Valdés|MC|75|1974", "Carlos Reinoso|MCO|77|1974",
    "Carlos Caszely|DC|80|1974", "Sergio Ahumada|DC|73|1974", "Leonardo Véliz|EI|73|1974"] },
  { c: 'AUS', y: 1974, f: '4-4-2', p: [
    "Jack Reilly|POR|66|1974", "Doug Utjesenovic|LD|64|1974", "Peter Wilson|DFC|66|1974", "Manfred Schaefer|DFC|64|1974",
    "Col Curran|LI|62|1974", "Ray Richards|MC|63|1974", "Jimmy Mackay|MC|64|1974", "Jimmy Rooney|MC|65|1974",
    "Johnny Warren|MC|65|1974", "Adrian Alston|DC|67|1974", "Attila Abonyi|DC|66|1974", "Branko Buljevic|DC|63|1974"] },
  { c: 'BRA', y: 1974, f: '4-3-3', p: [
    "Émerson Leão", "Zé Maria|LD|77|1970", "Luís Pereira|DFC|81|1974", "Marinho Peres|DFC|77|1974",
    "Marinho Chagas|LI|80|1974", "Piazza", "Paulo César Carpegiani|MC|79|1974", "Rivellino",
    "Jairzinho", "Valdomiro|ED|76|1974", "Leivinha|DC|77|1974", "Dirceu",
    "Paulo César Caju"] },
  { c: 'YUG', y: 1974, f: '4-3-3', p: [
    "Enver Marić|POR|78|1974", "Ivan Buljan|LD|78|1974", "Josip Katalinski|DFC|79|1974", "Dražen Mužinić|DFC|76|1974",
    "Enver Hadžiabdić|LI|75|1974", "Branko Oblak|MC|81|1974", "Jovan Aćimović|MC|79|1974", "Stanislav Karasi|MC|76|1974",
    "Ilija Petković|ED|76|1974", "Dušan Bajević|DC|80|1974", "Dragan Džajić|EI|87|1974", "Ivica Šurjak|EI|78|1974"] },
  { c: 'SCO', y: 1974, f: '4-4-2', p: [
    "David Harvey|POR|76|1974", "Sandy Jardine|LD|79|1974", "Jim Holton|DFC|75|1974", "Martin Buchan|DFC|80|1974",
    "Danny McGrain|LI|82|1974", "Billy Bremner|MC|86|1974", "David Hay|MC|77|1974", "Peter Lorimer|MD|81|1974",
    "Kenny Dalglish|MCO|88|1974", "Joe Jordan|DC|81|1974", "Denis Law|DC|85|1974", "Willie Morgan|ED|76|1974"] },
  { c: 'SUE', y: 1974, f: '4-4-2', p: [
    "Ronnie Hellström", "Jan Olsson|LD|72|1974", "Kent Karlsson|DFC|73|1974", "Björn Nordqvist",
    "Björn Andersson|LI|74|1974", "Bo Larsson", "Staffan Tapper|MCD|73|1974", "Ove Grahn",
    "Conny Torstensson|MC|77|1974", "Ralf Edström|DC|81|1974", "Roland Sandberg|DC|78|1974"] },
  { c: 'BUL', y: 1974, f: '4-3-3', p: [
    "Rumyancho Goranov|POR|72|1974", "Ivan Zafirov|LD|72|1974", "Kiril Ivkov|DFC|73|1974", "Stefan Velichkov|DFC|73|1974",
    "Dimitar Penev", "Bozhil Kolev|MC|76|1974", "Hristo Bonev", "Bozhidar Grigorov|MC|74|1974",
    "Voyn Voynov|ED|74|1974", "Pavel Panov|DC|75|1974", "Georgi Denev|EI|76|1974"] },
  { c: 'URU', y: 1974, f: '4-3-3', p: [
    "Ladislao Mazurkiewicz", "Pablo Forlán", "Juan Carlos Masnik|DFC|75|1974", "Baldomero Jáuregui|DFC|73|1974",
    "Ricardo Pavoni|LI|77|1974", "Julio Montero Castillo", "Víctor Espárrago", "Walter Mantegazza|MC|73|1974",
    "Pedro Rocha", "Luis Cubilla", "Fernando Morena|DC|82|1974"] },
  { c: 'ARG', y: 1974, f: '4-3-3', p: [
    "Daniel Carnevali|POR|75|1974", "Enrique Wolff|LD|77|1974", "Roberto Perfumo", "Ramón Heredia|DFC|77|1974",
    "Jorge Carrascosa|LI|76|1974", "Roberto Telch|MCD|75|1974", "Miguel Ángel Brindisi|MC|80|1974", "Carlos Babington|MCO|80|1974",
    "René Houseman", "Mario Kempes", "Rubén Ayala|EI|79|1974", "Héctor Yazalde|DC|79|1974",
    "Ubaldo Fillol"] },
  { c: 'ITA', y: 1974, f: '4-3-3', p: [
    "Dino Zoff", "Luciano Spinosi|LD|77|1974", "Tarcisio Burgnich", "Francesco Morini|DFC|77|1974",
    "Giacinto Facchetti", "Romeo Benetti", "Fabio Capello|MC|80|1974", "Gianni Rivera",
    "Sandro Mazzola", "Franco Causio", "Giorgio Chinaglia|DC|79|1974", "Pietro Anastasi|DC|79|1974",
    "Luigi Riva"] },
  { c: 'FRA', y: 1978, f: '4-3-3', p: [
    "Jean-Paul Bertrand-Demanes|POR|74|1978", "Gérard Janvion", "Marius Trésor", "Christian Lopez|DFC|77|1978",
    "Maxime Bossis", "Henri Michel|MCD|78|1978", "Dominique Bathenay|MC|77|1978", "Michel Platini",
    "Dominique Rocheteau", "Bernard Lacombe|DC|78|1978", "Didier Six", "Patrice Rio|DFC|73|1978"] },
  { c: 'HUN', y: 1978, f: '4-3-3', p: [
    "Sándor Gujdár|POR|73|1978", "Péter Török|LD|72|1978", "László Bálint|DFC|76|1978", "Zoltán Kereki|DFC|73|1978",
    "József Tóth|LI|73|1978", "Sándor Pintér|MCD|74|1978", "Sándor Zombori|MC|74|1978", "Tibor Nyilasi|MCO|82|1978",
    "Károly Csapó|MC|73|1978", "László Fazekas|ED|77|1978", "András Törőcsik|DC|80|1978", "László Nagy|EI|74|1978"] },
  { c: 'POL', y: 1978, f: '4-3-3', p: [
    "Jan Tomaszewski", "Antoni Szymanowski", "Władysław Żmuda", "Jerzy Gorgoń",
    "Henryk Maculewicz|LI|74|1978", "Henryk Kasperczak", "Kazimierz Deyna", "Adam Nawałka|MC|76|1978",
    "Bohdan Masztaler|MC|73|1978", "Grzegorz Lato", "Andrzej Szarmach", "Zbigniew Boniek",
    "Włodzimierz Lubański|DC|84|1978"] },
  { c: 'FRG', y: 1978, f: '4-3-3', p: [
    "Sepp Maier", "Berti Vogts", "Manfred Kaltz", "Rolf Rüssmann|DFC|79|1978",
    "Bernard Dietz|LI|80|1978", "Rainer Bonhof", "Heinz Flohe|MC|80|1974", "Hansi Müller|MCO|81|1978",
    "Karl-Heinz Rummenigge", "Klaus Fischer", "Dieter Müller|DC|82|1978", "Bernd Hölzenbein",
    "Rüdiger Abramczik|ED|77|1978"] },
  { c: 'TUN', y: 1978, f: '4-3-3', p: [
    "Mokhtar Naili|POR|67|1978", "Khaled Gasmi|LD|64|1978", "Amor Jebali|DFC|65|1978", "Mohsen Labidi|DFC|64|1978",
    "Ali Kaabi|LI|66|1978", "Mokhtar Dhouib|MC|66|1978", "Néjib Ghommidh|MC|66|1978", "Tarak Dhiab|MCO|72|1978",
    "Hamadi Agrebi|MCO|68|1978", "Témime Lahzami|ED|67|1978", "Mohamed Ali Akid|DC|68|1978"] },
  { c: 'MEX', y: 1978, f: '4-4-2', p: [
    "Pilar Reyes|POR|72|1974", "Manuel Nájera|LD|70|1978", "Alfredo Tena|DFC|73|1978", "Arturo Vázquez Ayala|DFC|72|1978",
    "Carlos Gómez|LI|69|1978", "Antonio de la Torre|MCD|71|1978", "Leonardo Cuéllar|MC|74|1978", "Guillermo Mendizábal|MCO|72|1978",
    "Raúl Isiordia|ED|70|1978", "Hugo Sánchez|DC|78|1978", "Víctor Rangel|DC|72|1978"] },
  { c: 'AUT', y: 1978, f: '4-4-2', p: [
    "Friedrich Koncilia|POR|79|1978", "Robert Sara|LD|76|1978", "Bruno Pezzey|DFC|82|1978", "Erich Obermayer|DFC|76|1978",
    "Gerhard Breitenberger|LI|73|1978", "Roland Hattenberger|MCD|74|1978", "Josef Hickersberger|MC|76|1978", "Herbert Prohaska|MC|84|1978",
    "Wilhelm Kreuz|MC|76|1978", "Kurt Jara|ED|78|1978", "Hans Krankl|DC|86|1978", "Walter Schachner|DC|77|1978"] },
  { c: 'ESP', y: 1978, f: '4-4-2', p: [
    "Miguel Ángel|POR|78|1978", "Marcelino Pérez|LD|73|1978", "Migueli|DFC|78|1978", "Antonio Biosca|DFC|73|1978",
    "Antonio de la Cruz|LI|74|1978", "Pirri", "Juan Manuel Asensi|MC|79|1978", "Julio Cardeñosa|MC|76|1978",
    "Juanito|ED|81|1978", "Santillana|DC|82|1978", "Rubén Cano|DC|77|1978", "Dani|EI|78|1978",
    "Luis Miguel Arconada|POR|80|1978"] },
  { c: 'SUE', y: 1978, f: '4-4-2', p: [
    "Ronnie Hellström", "Ingemar Erlandsson|LD|72|1978", "Roy Andersson|DFC|73|1978", "Björn Nordqvist",
    "Hasse Borg|LI|73|1978", "Bo Larsson", "Anders Linderoth|MC|74|1978", "Lennart Larsson|MC|74|1978",
    "Thomas Sjöberg|DC|74|1978", "Benny Wendt|DC|74|1978", "Ralf Edström"] },
  { c: 'IRN', y: 1978, f: '4-4-2', p: [
    "Nasser Hejazi|POR|72|1978", "Hassan Nazari|LD|67|1978", "Andranik Eskandarian|DFC|69|1978", "Hossein Kazerani|DFC|66|1978",
    "Nasrollah Abdollahi|LI|65|1978", "Ali Parvin|MC|72|1978", "Ebrahim Ghasempour|MC|67|1978", "Hassan Nayebagha|MC|65|1978",
    "Ghafour Jahani|EI|67|1978", "Hassan Rowshan|DC|68|1978", "Iraj Danaeifard|DC|68|1978"] },
  { c: 'SCO', y: 1978, f: '4-4-2', p: [
    "Alan Rough|POR|75|1978", "Stuart Kennedy|LD|73|1978", "Kenny Burns|DFC|78|1978", "Tom Forsyth|DFC|75|1978",
    "Willie Donachie|LI|74|1978", "Martin Buchan", "Graeme Souness|MC|86|1978", "Archie Gemmill|MC|80|1978",
    "Asa Hartford|MC|77|1978", "Bruce Rioch|MC|77|1978", "Kenny Dalglish", "Joe Jordan"] },
  { c: 'PER', y: 1978, f: '4-3-3', p: [
    "Ramón Quiroga|POR|74|1978", "Jaime Duarte|LD|71|1978", "Héctor Chumpitaz", "Rodolfo Manzo|DFC|70|1978",
    "Toribio Díaz|LI|69|1978", "José Velásquez|MCD|76|1978", "César Cueto|MC|81|1978", "Teófilo Cubillas",
    "Juan José Muñante|ED|74|1978", "Guillermo La Rosa|DC|72|1978", "Juan Carlos Oblitas|EI|78|1978", "Percy Rojas|DC|72|1978"] },
  { c: 'PER', y: 1982, f: '4-4-2', p: [
    "Ramón Quiroga", "Jaime Duarte", "Salvador Salguero|DFC|70|1982", "Rubén Toribio Díaz|DFC|75|1978",
    "Jorge Olaechea|LI|72|1982", "José Velásquez", "César Cueto", "Teófilo Cubillas",
    "Julio César Uribe|MCO|80|1982", "Juan Carlos Oblitas", "Gerónimo Barbadillo|ED|76|1982", "Guillermo La Rosa"] },
  { c: 'CMR', y: 1982, f: '4-4-2', p: [
    "Thomas N'Kono", "Ephrem M'Bom|LD|66|1982", "Michel Kaham|DFC|69|1982", "Ibrahim Aoudou|DFC|68|1982",
    "René N'Djeya|DFC|66|1982", "Emmanuel Kundé", "Elie Onana|LI|66|1982", "Théophile Abega|MC|74|1982",
    "Grégoire M'Bida|MC|71|1982", "Jacques N'Guea|MC|68|1982", "Jean-Pierre Tokoto|ED|71|1982", "Roger Milla"] },
  { c: 'AUT', y: 1982, f: '4-4-2', p: [
    "Friedrich Koncilia", "Bernd Krauss|LD|72|1982", "Erich Obermayer", "Bruno Pezzey",
    "Josef Degeorgi|LI|71|1982", "Roland Hattenberger", "Heribert Weber|MC|76|1978", "Herbert Prohaska",
    "Reinhold Hintermaier|MC|73|1982", "Walter Schachner", "Hans Krankl", "Kurt Jara"] },
  { c: 'ALG', y: 1982, f: '4-4-2', p: [
    "Mehdi Cerbah|POR|68|1982", "Chaabane Merzekane|LD|67|1982", "Mahmoud Guendouz|DFC|68|1982", "Noureddine Kourichi|DFC|67|1982",
    "Faouzi Mansouri|LI|66|1982", "Ali Fergani|MCD|68|1982", "Mustapha Dahleb|MC|72|1982", "Lakhdar Belloumi|MCO|78|1982",
    "Salah Assad|EI|74|1982", "Djamel Zidane|ED|67|1982", "Rabah Madjer|DC|78|1982", "Tedj Bensaoula|DC|70|1982"] },
  { c: 'CHI', y: 1982, f: '4-4-2', p: [
    "Mario Osbén|POR|72|1982", "Lizardo Garrido|LD|71|1982", "Elías Figueroa", "René Valenzuela|DFC|70|1982",
    "Vladimir Bigorra|LI|70|1982", "Rodolfo Dubó|MCD|70|1982", "Miguel Ángel Neira|MC|71|1982", "Manuel Rojas|MC|71|1982",
    "Patricio Yáñez|ED|74|1982", "Gustavo Moscoso|EI|71|1982", "Carlos Caszely", "Juan Carlos Letelier|DC|70|1982"] },
  { c: 'ARG', y: 1982, f: '4-3-3', p: [
    "Ubaldo Fillol", "Jorge Olguín", "Luis Galván", "Daniel Passarella",
    "Alberto Tarantini", "Américo Gallego", "Osvaldo Ardiles", "Diego Maradona",
    "Daniel Bertoni", "Mario Kempes", "Ramón Díaz|DC|82|1982", "Julio Olarticoechea"] },
  { c: 'BEL', y: 1982, f: '4-4-2', p: [
    "Jean-Marie Pfaff", "Eric Gerets", "Luc Millecamps|DFC|76|1982", "Walter Meeuws|DFC|77|1982",
    "Gerard Plessers|LI|74|1982", "Ludo Coeck|MC|80|1982", "René Vandereycken", "Franky Vercauteren",
    "Wilfried Van Moer", "Jan Ceulemans", "Erwin Vandenbergh|DC|81|1982", "Alex Czerniatynski|DC|74|1982"] },
  { c: 'HUN', y: 1982, f: '4-4-2', p: [
    "Ferenc Mészáros|POR|74|1978", "Győző Martos|LD|70|1982", "László Bálint", "József Tóth",
    "Imre Garaba|DFC|73|1982", "Sándor Müller|MC|73|1982", "Lázár Szentes|MC|71|1982", "Tibor Nyilasi",
    "László Fazekas", "András Törőcsik", "László Kiss|DC|73|1982", "Gábor Pölöskei|DC|73|1982"] },
  { c: 'ING', y: 1982, f: '4-4-2', p: [
    "Peter Shilton", "Mick Mills|LD|78|1982", "Phil Thompson|DFC|80|1982", "Terry Butcher",
    "Kenny Sansom", "Steve Coppell|MD|79|1982", "Bryan Robson", "Ray Wilkins|MC|81|1982",
    "Graham Rix|MI|76|1982", "Glenn Hoddle", "Trevor Francis|DC|83|1982", "Paul Mariner|DC|79|1982",
    "Kevin Keegan|DC|88|1982"] },
  { c: 'TCH', y: 1982, f: '4-4-2', p: [
    "Zdeněk Hruška|POR|73|1982", "František Jakubec|LD|71|1982", "Jozef Barmoš|DFC|73|1982", "Ladislav Jurkemik|DFC|76|1982",
    "Rostislav Vojáček|DFC|72|1982", "Jan Fiala|LI|73|1982", "Ján Kozák|MC|76|1982", "Přemysl Bičovský|MC|74|1982",
    "Antonín Panenka|MCO|82|1982", "Marián Masný|ED|79|1982", "Zdeněk Nehoda|DC|79|1982", "Ladislav Vízek|DC|76|1982"] },
  { c: 'KUW', y: 1982, f: '4-4-2', p: [
    "Ahmad Al-Tarabulsi|POR|66|1982", "Naeem Saad|LD|61|1982", "Mahboub Juma'a|DFC|62|1982", "Jamal Al-Qabendi|DFC|62|1982",
    "Abdullah Mayouf|LI|61|1982", "Saad Al-Houti|MC|65|1982", "Abdullah Al-Buloushi|MC|64|1982", "Fathi Kameel|MCO|66|1982",
    "Faisal Al-Dakhil|DC|68|1982", "Jasem Yaqoub|DC|67|1982", "Abdulaziz Al-Anberi|DC|64|1982"] },
  { c: 'ESP', y: 1982, f: '4-4-2', p: [
    "Luis Arconada|POR|85|1982", "José Antonio Camacho|LD|82|1982", "Miguel Tendillo|DFC|75|1982", "José Ramón Alesanco|DFC|75|1982",
    "Rafael Gordillo|LI|80|1982", "Periko Alonso|MC|76|1982", "Jesús María Zamora|MC|78|1982", "Joaquín Alonso|MC|75|1982",
    "Juanito", "Roberto López Ufarte|EI|77|1982", "Jesús María Satrústegui|DC|77|1978", "Quini|DC|80|1978"] },
  { c: 'NIR', y: 1982, f: '4-4-2', p: [
    "Pat Jennings|POR|86|1982", "Jimmy Nicholl|LD|76|1982", "Chris Nicholl|DFC|75|1982", "John McClelland|DFC|74|1982",
    "Mal Donaghy|LI|74|1982", "Noel Brotherston|ED|72|1982", "David McCreery|MCD|73|1982", "Martin O'Neill|MC|78|1982",
    "Sammy McIlroy|MC|78|1982", "Norman Whiteside|DC|77|1982", "Gerry Armstrong|DC|77|1982", "Billy Hamilton|DC|74|1982"] },
  { c: 'YUG', y: 1982, f: '4-4-2', p: [
    "Dragan Pantelić|POR|76|1982", "Nenad Stojković|LD|74|1982", "Velimir Zajec|DFC|79|1982", "Nikola Jovanović|DFC|74|1982",
    "Ivan Gudelj|MCD|74|1982", "Vladimir Petrović|MC|79|1982", "Edhem Šljivo|MC|76|1982", "Safet Sušić|MCO|85|1982",
    "Ivan Šurjak|EI|79|1974", "Zlatko Vujović|DC|78|1982", "Vahid Halilhodžić|DC|79|1982"] },
  { c: 'HON', y: 1982, f: '4-4-2', p: [
    "Julio César Arzú|POR|67|1982", "Efraín Gutiérrez|LD|62|1982", "Anthony Costly|DFC|62|1982", "Jaime Villegas|DFC|64|1982",
    "Fernando Bulnes|LI|62|1982", "Gilberto Yearwood|MCD|68|1982", "Ramón Maradiaga|MC|67|1982", "Héctor Zelaya|MC|65|1982",
    "Prudencio Norales|ED|64|1982", "Porfirio Betancourt|DC|65|1982", "Antonio Laing|DC|63|1982"] },
  { c: 'URS', y: 1982, f: '4-4-2', p: [
    "Rinat Dasayev|POR|86|1982", "Tengiz Sulakvelidze|LD|76|1982", "Aleksandre Chivadze|DFC|80|1982", "Vagiz Khidiyatullin|DFC|76|1982",
    "Sergei Baltacha|DFC|75|1982", "Anatoliy Demyanenko|LI|80|1982", "Vladimir Bessonov|MC|78|1982", "Yuri Gavrilov|MC|76|1982",
    "Andrei Bal|MC|74|1982", "Khoren Oganesian|MCO|77|1982", "Ramaz Shengelia|DC|78|1982", "Oleg Blokhin|DC|88|1982"] },
  { c: 'SCO', y: 1982, f: '4-4-2', p: [
    "Alan Rough", "Danny McGrain", "Alan Hansen|DFC|82|1982", "Willie Miller|DFC|80|1982",
    "Frank Gray|LI|76|1982", "Gordon Strachan|MD|82|1982", "Graeme Souness", "John Wark|MC|78|1982",
    "Asa Hartford", "John Robertson|EI|80|1982", "Kenny Dalglish", "Steve Archibald|DC|78|1982",
    "Joe Jordan"] },
  { c: 'ITA', y: 1986, f: '4-4-2', p: [
    "Giovanni Galli|POR|80|1986", "Giuseppe Bergomi", "Gaetano Scirea", "Fulvio Collovati",
    "Giuseppe Baresi|DFC|77|1986", "Antonio Cabrini", "Salvatore Bagni|MC|79|1986", "Fernando De Napoli",
    "Antonio Di Gennaro|MC|77|1986", "Bruno Conti", "Giuseppe Galderisi|DC|76|1986", "Alessandro Altobelli"] },
  { c: 'BUL', y: 1986, f: '4-4-2', p: [
    "Borislav Mihaylov", "Nikolay Arabov|LD|70|1986", "Georgi Dimitrov|DFC|74|1986", "Nikolay Iliev|DFC|71|1986",
    "Petar Petrov|LI|69|1986", "Ayan Sadakov|MC|73|1986", "Radoslav Zdravkov|MC|72|1986", "Plamen Markov|MC|72|1986",
    "Bozhidar Iskrenov|EI|73|1986", "Nasko Sirakov", "Plamen Getov|DC|74|1986"] },
  { c: 'KOR', y: 1986, f: '4-4-2', p: [
    "Oh Yun-kyo|POR|66|1986", "Park Kyung-hoon|LD|64|1986", "Kim Pyung-seok|DFC|63|1986", "Chung Yong-hwan|DFC|64|1986",
    "Cho Young-jeung|DFC|63|1986", "Huh Jung-moo|MC|70|1986", "Cho Kwang-rae|MC|67|1986", "Park Chang-sun|MC|68|1986",
    "Kim Joo-sung|MCO|70|1986", "Byun Byung-joo|ED|66|1986", "Cha Bum-kun|DC|80|1986", "Choi Soon-ho|DC|69|1986"] },
  { c: 'MEX', y: 1986, f: '4-4-2', p: [
    "Pablo Larios|POR|74|1986", "Mario Trejo|LD|70|1986", "Fernando Quirarte|DFC|74|1986", "Félix Cruz|DFC|71|1986",
    "Raúl Servín|LI|70|1986", "Miguel España|MCD|72|1986", "Carlos de los Cobos|MC|71|1986", "Javier Aguirre|MC|74|1986",
    "Tomás Boy|MCO|78|1986", "Manuel Negrete|MC|77|1986", "Hugo Sánchez", "Luis Flores|DC|73|1986"] },
  { c: 'PAR', y: 1986, f: '4-4-2', p: [
    "Roberto Fernández|POR|74|1986", "Juan Bautista Torales|LD|71|1986", "César Zabala|DFC|71|1986", "Rogelio Delgado|DFC|73|1986",
    "Vladimiro Schettina|LI|70|1986", "Jorge Amado Nunes|MC|71|1986", "Buenaventura Ferreira|MC|71|1986", "Jorge Guasch|MCD|70|1986",
    "Julio César Romero|MCO|82|1986", "Roberto Cabañas|DC|79|1986", "Alfredo Mendoza|DC|71|1986"] },
  { c: 'IRQ', y: 1986, f: '4-4-2', p: [
    "Raad Hammoudi|POR|67|1986", "Khalil Allawi|LD|64|1986", "Nadhim Shaker|DFC|65|1986", "Samir Shaker|DFC|64|1986",
    "Ali Hussein Shihab|LI|64|1986", "Basil Gorgis|MC|65|1986", "Natiq Hashim|MC|65|1986", "Haris Mohammed|MC|66|1986",
    "Ahmed Radhi|DC|72|1986", "Hussein Saeed|DC|70|1986", "Karim Saddam|DC|68|1986"] },
  { c: 'URS', y: 1986, f: '4-4-2', p: [
    "Rinat Dasayev", "Vladimir Bessonov", "Aleksandr Bubnov|DFC|76|1986", "Oleg Kuznetsov|DFC|77|1986",
    "Nikolai Larionov|DFC|73|1986", "Anatoliy Demyanenko", "Ivan Yaremchuk|MD|77|1986", "Pavel Yakovenko|MC|76|1986",
    "Sergei Aleinikov|MC|78|1986", "Vasiliy Rats|MI|78|1986", "Aleksandr Zavarov|MCO|81|1986", "Igor Belanov|DC|87|1986",
    "Oleg Blokhin"] },
  { c: 'HUN', y: 1986, f: '4-4-2', p: [
    "Péter Disztl|POR|70|1986", "Sándor Sallai|LD|71|1986", "Imre Garaba", "József Kardos|DFC|72|1986",
    "Antal Róth|LI|70|1986", "Antal Nagy|MC|73|1986", "Győző Burcsa|MC|72|1986", "Lajos Détári|MCO|82|1986",
    "Márton Esterházy|DC|76|1986", "József Kiprich|DC|74|1986", "Kálmán Kovács|DC|72|1986"] },
  { c: 'CAN', y: 1986, f: '4-4-2', p: [
    "Tino Lettieri|POR|68|1986", "Bob Lenarduzzi|LD|67|1986", "Ian Bridge|DFC|66|1986", "Randy Samuel|DFC|65|1986",
    "Bruce Wilson|LI|67|1986", "Randy Ragan|MC|65|1986", "Mike Sweeney|MC|64|1986", "Paul James|MC|64|1986",
    "Carl Valentine|ED|66|1986", "Branko Segota|EI|66|1986", "Dale Mitchell|DC|68|1986", "Igor Vrablic|DC|65|1986"] },
  { c: 'ESP', y: 1986, f: '4-4-2', p: [
    "Andoni Zubizarreta|POR|84|1986", "Tomás Reñones|LD|74|1986", "Andoni Goikoetxea|DFC|76|1986", "Antonio Maceda|DFC|78|1986",
    "José Antonio Camacho", "Víctor Muñoz|MCD|77|1986", "Ricardo Gallego|MC|77|1986", "Míchel|MD|82|1986",
    "Rafael Gordillo", "Eloy Olaya|ED|74|1986", "Emilio Butragueño|DC|86|1986", "Julio Salinas|DC|78|1986"] },
  { c: 'NIR', y: 1986, f: '4-4-2', p: [
    "Pat Jennings", "Jimmy Nicholl", "John McClelland", "Alan McDonald|DFC|73|1986",
    "Nigel Worthington|LI|72|1986", "Mal Donaghy", "David McCreery", "Sammy McIlroy",
    "Ian Stewart|EI|70|1986", "Norman Whiteside", "Colin Clarke|DC|74|1986", "Billy Hamilton"] },
  { c: 'ALG', y: 1986, f: '4-4-2', p: [
    "Nasser Drid|POR|67|1986", "Mahmoud Guendouz", "Fodil Megharia|DFC|66|1986", "Noureddine Kourichi",
    "Faouzi Mansouri", "Mohamed Kaci-Saïd|MC|67|1986", "Lakhdar Belloumi", "Djamel Zidane",
    "Salah Assad", "Rabah Madjer", "Djamel Menad|DC|70|1986", "Tedj Bensaoula"] },
  { c: 'URU', y: 1986, f: '4-4-2', p: [
    "Fernando Álvez|POR|74|1986", "Víctor Diogo|LD|71|1986", "Nelson Gutiérrez|DFC|76|1986", "Eduardo Acevedo|DFC|73|1986",
    "Darío Pereyra|DFC|78|1986", "José Batista|MCD|72|1986", "Miguel Bossio|MC|73|1986", "Jorge Barrios|MC|76|1986",
    "Enzo Francescoli|MCO|88|1986", "Antonio Alzamendi|ED|76|1986", "Venancio Ramos|EI|74|1986", "Jorge da Silva|DC|74|1986"] },
  { c: 'SCO', y: 1986, f: '4-4-2', p: [
    "Jim Leighton|POR|76|1986", "Richard Gough|LD|78|1986", "Alex McLeish|DFC|79|1982", "Willie Miller",
    "Maurice Malpas|LI|75|1986", "Gordon Strachan", "Graeme Souness", "Roy Aitken|MCD|76|1986",
    "Paul McStay|MC|78|1986", "Eamonn Bannon|MI|72|1986", "Charlie Nicholas|DC|77|1986", "Steve Archibald"] },
  { c: 'MAR', y: 1986, f: '4-4-2', p: [
    "Badou Zaki|POR|82|1986", "Labid Khalifa|LD|68|1986", "Mustapha El Biyaz|DFC|68|1986", "Noureddine Bouyahyaoui|DFC|69|1986",
    "Abdelmajid Lamriss|LI|67|1986", "Abdelmajid Dolmy|MC|74|1986", "Aziz Bouderbala|MC|76|1986", "Mohamed Timoumi|MCO|78|1986",
    "Mustafa El Haddaoui|ED|72|1986", "Abderrazak Khairi|DC|71|1986", "Mustapha Merry|DC|70|1986"] },
  { c: 'POL', y: 1986, f: '4-4-2', p: [
    "Józef Młynarczyk", "Kazimierz Przybyś|LD|70|1986", "Roman Wójcicki|DFC|75|1986", "Władysław Żmuda",
    "Marek Ostrowski|LI|71|1986", "Waldemar Matysik", "Ryszard Komornicki|MC|71|1986", "Jan Urban|MC|73|1986",
    "Andrzej Buncol", "Zbigniew Boniek", "Włodzimierz Smolarek", "Dariusz Dziekanowski|DC|76|1986"] },
  { c: 'POR', y: 1986, f: '4-4-2', p: [
    "Manuel Bento|POR|78|1986", "Álvaro Magalhães|LD|72|1986", "Frederico|DFC|71|1986", "Inácio|LI|70|1986",
    "Jaime Pacheco|MCD|72|1986", "Carlos Manuel|MC|77|1986", "Jaime Magalhães|MC|72|1986", "António Sousa|MC|73|1986",
    "Diamantino Miranda|MC|73|1986", "Paulo Futre|EI|82|1986", "Fernando Gomes|DC|82|1986"] },
  { c: 'ROU', y: 1990, f: '4-4-2', p: [
    "Silviu Lung|POR|76|1990", "Mircea Rednic|LD|76|1990", "Ioan Andone|DFC|77|1990", "Gheorghe Popescu",
    "Michael Klein|LI|77|1990", "Iosif Rotariu|MD|74|1990", "Ioan Lupescu", "Ioan Sabău|MC|77|1990",
    "Gheorghe Hagi", "Marius Lăcătuș|DC|83|1990", "Gavril Balint|DC|78|1990", "Florin Răducioiu",
    "Daniel Timofte|MC|73|1990"] },
  { c: 'URS', y: 1990, f: '4-4-2', p: [
    "Rinat Dasayev", "Vladimir Bessonov", "Oleh Kuznetsov|DFC|80|1986", "Sergei Gorlukovich|DFC|76|1990",
    "Anatoliy Demyanenko", "Vasiliy Rats", "Sergei Aleinikov", "Hennadiy Lytovchenko|MC|80|1990",
    "Oleksandr Zavarov|MCO|83|1986", "Igor Dobrovolski|MCO|80|1990", "Oleh Protasov|DC|81|1986", "Igor Belanov"] },
  { c: 'AUT', y: 1990, f: '4-4-2', p: [
    "Klaus Lindenberger|POR|76|1990", "Kurt Russ|LD|72|1990", "Robert Pecl|DFC|74|1990", "Anton Pfeffer|DFC|74|1990",
    "Michael Streiter|LI|71|1990", "Manfred Linzmaier|MD|73|1990", "Peter Artner|MC|72|1990", "Manfred Zsak|MC|73|1990",
    "Andreas Herzog|MCO|79|1990", "Gerhard Rodax|DC|74|1990", "Toni Polster|DC|81|1990", "Andreas Ogris|DC|75|1990",
    "Ernst Aigner|DFC|72|1990"] },
  { c: 'USA', y: 1990, f: '5-3-2', p: [
    "Tony Meola|POR|73|1990", "Paul Caligiuri|LD|72|1990", "Mike Windischmann|DFC|70|1990", "Desmond Armstrong|DFC|69|1990",
    "Marcelo Balboa|DFC|72|1990", "Jimmy Banks|LI|66|1990", "John Harkes|MC|74|1990", "Tab Ramos|MCO|75|1990",
    "John Doyle|DFC|68|1990", "Bruce Murray|DC|70|1990", "Peter Vermes|DC|69|1990", "Eric Wynalda|DC|73|1990"] },
  { c: 'TCH', y: 1990, f: '4-4-2', p: [
    "Jan Stejskal|POR|77|1990", "František Straka|LD|73|1990", "Miroslav Kadlec|DFC|78|1990", "Ján Kocian|DFC|76|1990",
    "Vladimír Kinier|LI|72|1990", "Jozef Chovanec|MCD|77|1990", "Ivan Hašek|MC|79|1990", "Michal Bílek|MC|78|1990",
    "Ľubomír Moravčík|MCO|80|1990", "Luboš Kubík|MC|78|1990", "Tomáš Skuhravý|DC|83|1990", "Milan Luhový|DC|73|1990",
    "Stanislav Griga|DC|74|1990"] },
  { c: 'BRA', y: 1990, f: '3-5-2', p: [
    "Taffarel", "Mauro Galvão|DFC|80|1986", "Ricardo Gomes|DFC|82|1990", "Ricardo Rocha|DFC|79|1990",
    "Jorginho", "Branco", "Dunga", "Alemão",
    "Valdo|MC|80|1990", "Careca", "Müller", "Bebeto",
    "Romário"] },
  { c: 'CRC', y: 1990, f: '5-3-2', p: [
    "Luis Gabelo Conejo|POR|79|1990", "Rónald González|LD|68|1990", "Héctor Marchena|DFC|70|1990", "Roger Flores|DFC|71|1990",
    "Mauricio Montero|DFC|69|1990", "José Carlos Chaves|LI|67|1990", "Óscar Ramírez|MC|72|1990", "Juan Cayasso|MC|72|1990",
    "Alexandre Guimarães|MC|70|1990", "Claudio Jara|DC|70|1990", "Hernán Medford|DC|71|1990"] },
  { c: 'SCO', y: 1990, f: '4-4-2', p: [
    "Jim Leighton", "Stewart McKimmie|LD|73|1990", "Alex McLeish", "Craig Levein|DFC|74|1990",
    "Maurice Malpas", "Roy Aitken", "Paul McStay", "Murdo MacLeod|MC|74|1990",
    "Stuart McCall|MC|76|1990", "Mo Johnston|DC|80|1990", "Ally McCoist|DC|80|1990", "Gary Gillespie|DFC|75|1990",
    "Dave McPherson|DFC|73|1990"] },
  { c: 'SUE', y: 1990, f: '4-4-2', p: [
    "Thomas Ravelli", "Roland Nilsson", "Peter Larsson|DFC|76|1990", "Glenn Hysén|DFC|80|1990",
    "Roger Ljung", "Jonas Thern", "Stefan Schwarz", "Klas Ingesson",
    "Glenn Strömberg|MC|78|1990", "Anders Limpar|EI|80|1990", "Tomas Brolin", "Johnny Ekström|DC|76|1990",
    "Stefan Pettersson|DC|73|1990"] },
  { c: 'YUG', y: 1990, f: '4-4-2', p: [
    "Tomislav Ivković|POR|79|1990", "Vujadin Stanojković|LD|73|1990", "Faruk Hadžibegić|DFC|78|1990", "Davor Jozić|DFC|76|1990",
    "Predrag Spasić|DFC|74|1990", "Zoran Vulić|LI|74|1990", "Refik Šabanadžović|MCD|75|1990", "Srečko Katanec|MC|79|1990",
    "Robert Prosinečki", "Dragan Stojković|MCO|89|1990", "Safet Sušić", "Dejan Savićević|MCO|86|1990",
    "Darko Pančev|DC|84|1990"] },
  { c: 'COL', y: 1990, f: '4-4-2', p: [
    "René Higuita|POR|82|1990", "Luis Fernando Herrera|LD|74|1990", "Andrés Escobar|DFC|80|1990", "Luis Carlos Perea|DFC|76|1990",
    "Gildardo Gómez|LI|72|1990", "Leonel Álvarez|MCD|79|1990", "Gabriel Jaime Gómez|MC|76|1990", "Carlos Valderrama|MCO|89|1990",
    "Bernardo Redín|MC|76|1990", "Freddy Rincón|MC|81|1990", "Carlos Estrada|DC|72|1990", "Arnoldo Iguarán|DC|76|1990"] },
  { c: 'UAE', y: 1990, f: '4-4-2', p: [
    "Muhsin Musabah|POR|64|1990", "Ibrahim Meer|LD|61|1990", "Khalil Ghanim|DFC|62|1990", "Mubarak Ghanim|DFC|61|1990",
    "Eissa Meer|LI|61|1990", "Abdullah Musa|MCD|61|1990", "Abdulrahman Mohamed|MC|62|1990", "Nasser Khamees|MC|63|1990",
    "Fahad Khamees|MC|63|1990", "Khalid Ismaïl|MCO|65|1990", "Adnan Al-Talyani|DC|69|1990", "Zuhair Bakhit|DC|65|1990",
    "Ali Thani|DC|64|1990"] },
  { c: 'ESP', y: 1990, f: '4-4-2', p: [
    "Andoni Zubizarreta", "Chendo|LD|76|1986", "Genar Andrinúa|DFC|75|1990", "Manuel Sanchís",
    "Manolo Jiménez|LI|74|1990", "Míchel", "Roberto Fernández", "Rafael Martín Vázquez|MC|81|1990",
    "Francisco Villarroya|MI|73|1990", "Emilio Butragueño", "Julio Salinas", "Fernando Hierro|DFC|80|1990",
    "Alberto Górriz|DFC|75|1990"] },
  { c: 'BEL', y: 1990, f: '4-4-2', p: [
    "Michel Preud'homme|POR|86|1990", "Eric Gerets", "Georges Grün", "Stéphane Demol",
    "Leo Clijsters|DFC|78|1986", "Michel De Wolf|LI|76|1986", "Franky Van der Elst|MCD|78|1986", "Bruno Versavel|MC|75|1990",
    "Patrick Vervoort|MI|77|1990", "Enzo Scifo", "Marc Degryse|MCO|80|1990", "Jan Ceulemans",
    "Marc Van der Linden|DC|76|1990"] },
  { c: 'URU', y: 1990, f: '4-4-2', p: [
    "Fernando Álvez", "José Herrera|LD|74|1990", "Nelson Gutiérrez", "Hugo De León|DFC|79|1990",
    "Alfonso Domínguez|LI|73|1990", "José Perdomo|MCD|76|1990", "Santiago Ostolaza|MC|74|1990", "Rubén Paz|MC|80|1990",
    "Enzo Francescoli", "Rubén Sosa|DC|83|1990", "Carlos Aguilera|DC|79|1990", "Daniel Fonseca|DC|77|1990"] },
  { c: 'KOR', y: 1990, f: '4-4-2', p: [
    "Choi In-young|POR|70|1990", "Choi Kang-hee|LD|68|1990", "Hong Myung-bo", "Park Kyung-hoon",
    "Chung Yong-hwan", "Gu Sang-bum|LI|67|1990", "Lee Young-jin|MCD|67|1990", "Hwangbo Kwan|MC|72|1990",
    "Kim Joo-sung", "Choi Soon-ho", "Hwang Seon-hong|DC|72|1990", "Byun Byung-joo"] },
  { c: 'IRL', y: 1990, f: '4-4-2', p: [
    "Packie Bonner|POR|79|1990", "Chris Morris|LD|73|1990", "Mick McCarthy|DFC|76|1990", "Kevin Moran|DFC|76|1990",
    "Steve Staunton|LI|77|1990", "Ray Houghton|MD|78|1990", "Paul McGrath|MCD|83|1990", "Andy Townsend|MC|77|1990",
    "Kevin Sheedy|MI|76|1990", "Ronnie Whelan|MC|77|1990", "John Aldridge|DC|79|1990", "Tony Cascarino|DC|75|1990",
    "Niall Quinn|DC|76|1990"] },
  { c: 'EGY', y: 1990, f: '4-4-2', p: [
    "Ahmed Shobair|POR|70|1990", "Ibrahim Hassan|LD|68|1990", "Hany Ramzy|DFC|71|1990", "Hesham Yakan|DFC|67|1990",
    "Rabie Yassin|LI|66|1990", "Ashraf Kasem|DFC|66|1990", "Ahmed Ramzy|MC|67|1990", "Magdi Abdelghani|MC|70|1990",
    "Ismail Youssef|MC|66|1990", "Taher Abouzeid|MCO|69|1990", "Hossam Hassan|DC|72|1990", "Ahmed El-Kass|DC|67|1990"] },
  { c: 'USA', y: 1994, f: '4-4-2', p: [
    "Tony Meola", "Paul Caligiuri", "Alexi Lalas|DFC|74|1994", "Marcelo Balboa",
    "Fernando Clavijo|LI|70|1994", "Earnie Stewart|MD|73|1994", "Thomas Dooley|MC|74|1994", "John Harkes",
    "Tab Ramos", "Cobi Jones|MI|72|1994", "Eric Wynalda", "Roy Wegerle|DC|71|1994",
    "Mike Sorber|MC|69|1994"] },
  { c: 'SUI', y: 1994, f: '4-4-2', p: [
    "Marco Pascolo|POR|74|1994", "Marc Hottiger|LD|74|1994", "Alain Geiger|DFC|78|1994", "Dominique Herr|DFC|73|1994",
    "Yvan Quentin|LI|71|1994", "Christophe Ohrel|MD|72|1994", "Ciriaco Sforza|MC|80|1994", "Georges Bregy|MC|75|1994",
    "Alain Sutter|MI|77|1994", "Thomas Bickel|MC|72|1994", "Stéphane Chapuisat|DC|83|1994", "Adrian Knup|DC|77|1994"] },
  { c: 'COL', y: 1994, f: '4-4-2', p: [
    "Óscar Córdoba|POR|78|1994", "Luis Fernando Herrera", "Andrés Escobar", "Luis Carlos Perea",
    "Wilson Pérez|LI|74|1994", "Leonel Álvarez", "Gabriel Jaime Gómez", "Hermán Gaviria|MC|74|1994",
    "Freddy Rincón", "Carlos Valderrama", "Faustino Asprilla|DC|85|1994", "Adolfo Valencia|DC|77|1994"] },
  { c: 'RUS', y: 1994, f: '4-4-2', p: [
    "Dmitri Kharine|POR|79|1994", "Omari Tetradze|LD|74|1994", "Yuri Nikiforov|DFC|76|1994", "Sergei Gorlukovich",
    "Dmitri Khlestov|LI|73|1994", "Valeri Karpin|MD|78|1994", "Igor Shalimov|MC|79|1994", "Andrei Pyatnitsky|MC|74|1994",
    "Ilya Tsymbalar|MI|77|1994", "Igor Dobrovolski", "Oleg Salenko|DC|78|1994", "Dmitri Radchenko|DC|75|1994",
    "Vladimir Beschastnykh|DC|76|1994"] },
  { c: 'CMR', y: 1994, f: '4-4-2', p: [
    "Joseph-Antoine Bell|POR|76|1982", "Jacques Songo'o|POR|74|1990", "Stephen Tataw", "Rigobert Song|DFC|72|1994",
    "Raymond Kalla|DFC|70|1994", "Hans Agbo|LI|67|1994", "Marc-Vivien Foé|MC|74|1994", "Émile Mbouh",
    "Louis-Paul M'Fédé", "François Omam-Biyik", "Roger Milla", "David Embé|DC|69|1994",
    "Alphonse Tchami|DC|71|1994"] },
  { c: 'GER', y: 1994, f: '3-5-2', p: [
    "Bodo Illgner", "Jürgen Kohler", "Lothar Matthäus", "Thomas Helmer|DFC|80|1994",
    "Thomas Berthold", "Guido Buchwald", "Thomas Häßler", "Matthias Sammer|MC|85|1994",
    "Andreas Möller|MCO|85|1990", "Andreas Brehme", "Stefan Effenberg|MC|84|1994", "Jürgen Klinsmann",
    "Rudi Völler"] },
  { c: 'ESP', y: 1994, f: '4-4-2', p: [
    "Andoni Zubizarreta", "Albert Ferrer|LD|80|1994", "Fernando Hierro", "Miguel Ángel Nadal|DFC|81|1994",
    "Rafael Alkorta|DFC|78|1994", "Sergi Barjuán|LI|79|1994", "Pep Guardiola|MC|85|1994", "José Luis Caminero|MC|83|1994",
    "Andoni Goikoetxea", "Luis Enrique|MD|82|1994", "Txiki Begiristain|EI|79|1994", "Julio Salinas",
    "Julen Guerrero|MCO|82|1994"] },
  { c: 'KOR', y: 1994, f: '4-4-2', p: [
    "Choi In-young", "Lee Woon-jae", "Kim Pan-keun|LD|68|1994", "Hong Myung-bo",
    "Park Jung-bae|DFC|69|1994", "Choi Young-il|DFC|69|1994", "Shin Hong-gi|LI|70|1994", "Noh Jung-yoon|MC|70|1994",
    "Ko Jeong-woon|MC|70|1994", "Seo Jung-won|MC|72|1994", "Kim Joo-sung", "Hwang Seon-hong"] },
  { c: 'NGA', y: 1994, f: '4-4-2', p: [
    "Peter Rufai|POR|74|1994", "Augustine Eguavoen|LD|73|1994", "Uche Okechukwu|DFC|75|1994", "Chidi Nwanu|DFC|73|1994",
    "Ben Iroha|LI|72|1994", "Sunday Oliseh|MCD|78|1994", "Jay-Jay Okocha|MCO|83|1994", "Finidi George|ED|80|1994",
    "Emmanuel Amunike|EI|80|1994", "Daniel Amokachi|DC|79|1994", "Rashidi Yekini|DC|80|1994", "Samson Siasia|DC|74|1994",
    "Stephen Keshi|DFC|74|1994"] },
  { c: 'GRE', y: 1994, f: '4-4-2', p: [
    "Antonis Minou|POR|67|1994", "Stratos Apostolakis|LD|69|1994", "Stelios Manolas|DFC|70|1994", "Ioannis Kalitzakis|DFC|67|1994",
    "Kyriakos Karataidis|LI|67|1994", "Panagiotis Tsalouchidis|MC|69|1994", "Nikolaos Nioplias|MC|69|1994", "Tasos Mitropoulos|MC|70|1994",
    "Savvas Kofidis|MC|68|1994", "Dimitris Saravakos|ED|70|1994", "Nikos Machlas|DC|70|1994", "Alexis Alexoudis|DC|66|1994"] },
  { c: 'NED', y: 1994, f: '4-3-3', p: [
    "Ed de Goey|POR|79|1994", "Aron Winter", "Stan Valckx|DFC|76|1994", "Ronald Koeman",
    "Frank de Boer", "Frank Rijkaard", "Jan Wouters", "Wim Jonk|MC|82|1994",
    "Ronald de Boer", "Dennis Bergkamp", "Marc Overmars", "Bryan Roy|EI|80|1994",
    "Gaston Taument|ED|76|1994"] },
  { c: 'KSA', y: 1994, f: '4-4-2', p: [
    "Mohamed Al-Deayea|POR|74|1994", "Ahmed Madani|LD|67|1994", "Mohammed Al-Khilaiwi|DFC|69|1994", "Abdullah Zubromawi|DFC|68|1994",
    "Mohammed Abd Al-Jawad|LI|68|1994", "Fuad Anwar|MC|71|1994", "Khalid Al-Muwallid|MC|69|1994", "Fahad Al-Ghesheyan|MD|70|1994",
    "Saeed Al-Owairan|MCO|77|1994", "Sami Al-Jaber|DC|74|1994", "Majed Abdullah|DC|73|1994", "Fahad Al-Bishi|DC|69|1994"] },
  { c: 'BEL', y: 1994, f: '4-4-2', p: [
    "Michel Preud'homme", "Dirk Medved|LD|72|1994", "Georges Grün", "Philippe Albert|DFC|81|1994",
    "Michel De Wolf", "Rudi Smidts|LI|72|1994", "Franky Van der Elst", "Lorenzo Staelens|MC|78|1990",
    "Enzo Scifo", "Danny Boffin|MI|74|1994", "Marc Degryse", "Josip Weber|DC|76|1994",
    "Luc Nilis|DC|79|1994"] },
  { c: 'MAR', y: 1994, f: '4-4-2', p: [
    "Khalil Azmi|POR|70|1994", "Rachid Neqrouz|LD|69|1994", "Noureddine Naybet|DFC|76|1994", "Smahi Triki|DFC|68|1994",
    "Abdelkrim El Hadrioui|LI|70|1994", "Tahar El Khalej|MCD|70|1994", "Rachid Azzouzi|MC|71|1994", "Rachid Daoudi|MC|71|1994",
    "Mustapha Hadji|MCO|76|1994", "Ahmed Bahja|DC|70|1994", "Hassan Nader|DC|72|1994", "Abdeslam Laghrissi|DC|68|1994"] },
  { c: 'IRL', y: 1994, f: '4-4-2', p: [
    "Packie Bonner", "Denis Irwin|LD|81|1994", "Paul McGrath", "Phil Babb|DFC|76|1994",
    "Terry Phelan|LI|75|1994", "Ray Houghton", "Roy Keane|MC|84|1994", "John Sheridan|MC|77|1994",
    "Andy Townsend", "Steve Staunton", "Jason McAteer|MD|74|1994", "John Aldridge",
    "Tommy Coyne|DC|72|1994"] },
  { c: 'NOR', y: 1994, f: '4-3-3', p: [
    "Erik Thorstvedt|POR|78|1994", "Gunnar Halle|LD|74|1994", "Rune Bratseth|DFC|79|1994", "Henning Berg|DFC|79|1994",
    "Stig Inge Bjørnebye|LI|76|1994", "Erik Mykland|MC|77|1994", "Kjetil Rekdal|MC|78|1994", "Øyvind Leonhardsen|MC|78|1994",
    "Lars Bohinen|MC|76|1994", "Jostein Flo|ED|76|1994", "Jan Åge Fjørtoft|DC|76|1994", "Mini Jakobsen|EI|72|1994"] },
  { c: 'MEX', y: 1994, f: '4-4-2', p: [
    "Jorge Campos|POR|82|1994", "Jorge Rodríguez|LD|70|1994", "Claudio Suárez|DFC|78|1994", "Juan de Dios Ramírez Perales|DFC|74|1994",
    "Ramón Ramírez|LI|76|1994", "Ignacio Ambriz|MCD|74|1994", "Alberto García Aspe|MC|78|1994", "Marcelino Bernal|MC|74|1994",
    "Joaquín del Olmo|MC|73|1994", "Luis García|DC|79|1994", "Hugo Sánchez", "Zague|DC|75|1994"] },
  { c: 'SCO', y: 1998, f: '3-5-2', p: [
    "Jim Leighton", "Colin Calderwood|DFC|74|1998", "Colin Hendry|DFC|79|1998", "Tom Boyd|DFC|74|1998",
    "Craig Burley|MD|76|1998", "Christian Dailly|MI|73|1998", "Paul Lambert|MCD|78|1998", "John Collins|MC|79|1998",
    "Jackie McNamara|MC|72|1998", "Kevin Gallacher|DC|76|1998", "Gordon Durie|DC|74|1990", "Darren Jackson|DC|72|1998"] },
  { c: 'MAR', y: 1998, f: '4-4-2', p: [
    "Driss Benzekri|POR|72|1994", "Abdelilah Saber|LD|71|1998", "Noureddine Naybet", "Youssef Rossi|DFC|70|1998",
    "Smahi Triki", "Abdelkrim El Hadrioui", "Tahar El Khalej", "Youssef Chippo|MC|74|1998",
    "Said Chiba|MC|73|1998", "Mustapha Hadji", "Salaheddine Bassir|DC|76|1998", "Abdeljalil Hadda|DC|74|1998"] },
  { c: 'NOR', y: 1998, f: '4-3-3', p: [
    "Frode Grodås|POR|77|1994", "Henning Berg", "Ronny Johnsen|DFC|81|1998", "Dan Eggen|DFC|75|1998",
    "Stig Inge Bjørnebye", "Erik Mykland", "Kjetil Rekdal", "Øyvind Leonhardsen",
    "Ståle Solbakken|MC|74|1998", "Håvard Flo|ED|75|1998", "Tore André Flo|DC|82|1998", "Ole Gunnar Solskjær|DC|81|1998"] },
  { c: 'ITA', y: 1998, f: '4-4-2', p: [
    "Gianluca Pagliuca", "Giuseppe Bergomi", "Alessandro Costacurta", "Fabio Cannavaro",
    "Alessandro Nesta|DFC|86|1998", "Paolo Maldini", "Francesco Moriero|MD|77|1998", "Luigi Di Biagio|MC|79|1998",
    "Dino Baggio", "Demetrio Albertini", "Alessandro Del Piero", "Roberto Baggio",
    "Christian Vieri|DC|88|1998"] },
  { c: 'CHI', y: 1998, f: '3-5-2', p: [
    "Nelson Tapia|POR|73|1998", "Javier Margas|DFC|74|1998", "Pedro Reyes|DFC|72|1998", "Ronald Fuentes|DFC|72|1998",
    "Miguel Ramírez|DFC|72|1998", "Moisés Villarroel|MD|71|1998", "Nelson Parraguez|MCD|71|1998", "Clarence Acuña|MC|72|1998",
    "Fabián Estay|MCO|73|1998", "José Luis Sierra|MCO|76|1998", "Marcelo Salas|DC|87|1998", "Iván Zamorano|DC|85|1998"] },
  { c: 'CMR', y: 1998, f: '4-4-2', p: [
    "Jacques Songo'o", "Rigobert Song", "Raymond Kalla", "Pierre Njanka|DFC|72|1998",
    "Pierre Womé|LI|72|1998", "Lauren|MD|74|1998", "Marc-Vivien Foé", "Salomon Olembé|MI|73|1998",
    "Patrick Mboma|DC|79|1998", "Joseph-Désiré Job|DC|73|1998", "Samuel Eto'o|DC|76|1998"] },
  { c: 'AUT', y: 1998, f: '3-5-2', p: [
    "Michael Konsel|POR|78|1998", "Peter Schöttel|DFC|70|1990", "Anton Pfeffer", "Wolfgang Feiersinger|DFC|72|1998",
    "Markus Schopp|MD|72|1998", "Roman Mählich|MC|70|1998", "Dietmar Kühbauer|MC|74|1998", "Andreas Herzog",
    "Ivica Vastić|MCO|76|1998", "Toni Polster", "Mario Haas|DC|72|1998"] },
  { c: 'DEN', y: 1998, f: '4-4-2', p: [
    "Peter Schmeichel|POR|89|1998", "Thomas Helveg|LD|76|1998", "Marc Rieper|DFC|77|1998", "Jes Høgh|DFC|76|1998",
    "Jan Heintze|LI|75|1998", "Allan Nielsen|MC|75|1998", "Per Frandsen|MC|74|1998", "Martin Jørgensen|MD|77|1998",
    "Michael Laudrup", "Brian Laudrup|ED|87|1998", "Ebbe Sand|DC|78|1998", "Peter Møller|DC|74|1998"] },
  { c: 'RSA', y: 1998, f: '4-4-2', p: [
    "Hans Vonk|POR|72|1998", "Alfred Phiri|LD|68|1998", "Lucas Radebe|DFC|79|1998", "Mark Fish|DFC|77|1998",
    "Pierre Issa|DFC|69|1998", "John Moshoeu|MC|72|1998", "Doctor Khumalo|MCO|74|1998", "Quinton Fortune|MC|72|1998",
    "Helman Mkhalele|MI|71|1998", "Benni McCarthy|DC|77|1998", "Shaun Bartlett|DC|74|1998", "Phil Masinga|DC|72|1998"] },
  { c: 'KSA', y: 1998, f: '4-4-2', p: [
    "Mohamed Al-Deayea", "Ahmed Al-Dokhi|DFC|67|1998", "Mohammed Al-Khilaiwi", "Abdullah Zubromawi",
    "Hussein Abdulghani|LI|68|1998", "Fuad Anwar", "Khalid Al-Muwallid", "Ibrahim Al-Shahrani|MC|66|1998",
    "Yousuf Al-Thunayan|MCO|72|1998", "Sami Al-Jaber", "Obeid Al-Dosari|DC|67|1998"] },
  { c: 'NGA', y: 1998, f: '4-4-2', p: [
    "Peter Rufai", "Mobi Oparaku|LD|70|1998", "Taribo West|DFC|78|1998", "Uche Okechukwu",
    "Celestine Babayaro|LI|76|1998", "Sunday Oliseh", "Mutiu Adepoju|MC|74|1994", "Garba Lawal|MC|73|1998",
    "Jay-Jay Okocha", "Finidi George", "Victor Ikpeba|DC|77|1994", "Nwankwo Kanu|DC|82|1998",
    "Daniel Amokachi"] },
  { c: 'PAR', y: 1998, f: '4-4-2', p: [
    "José Luis Chilavert|POR|87|1998", "Francisco Arce|LD|79|1998", "Carlos Gamarra|DFC|84|1998", "Celso Ayala|DFC|80|1998",
    "Pedro Sarabia|LI|74|1998", "Denis Caniza|LD|74|1998", "Julio César Enciso|MCD|74|1998", "Carlos Paredes|MC|75|1998",
    "Roberto Acuña|MC|78|1998", "Jorge Luis Campos|MCO|74|1998", "José Cardozo|DC|79|1998", "Miguel Ángel Benítez|DC|76|1998"] },
  { c: 'ESP', y: 1998, f: '4-4-2', p: [
    "Andoni Zubizarreta", "Albert Ferrer", "Fernando Hierro", "Abelardo|DFC|79|1994",
    "Rafael Alkorta", "Sergi|LI|79|1994", "Luis Enrique", "Julen Guerrero",
    "Kiko|DC|79|1998", "Alfonso|DC|78|1998", "Fernando Morientes|DC|82|1998", "Raúl|DC|88|1998"] },
  { c: 'BUL', y: 1998, f: '4-4-2', p: [
    "Zdravko Zdravkov|POR|72|1998", "Radostin Kishishev|LD|72|1998", "Trifon Ivanov", "Zlatko Yankov",
    "Ivaylo Petkov|LI|71|1998", "Ilian Iliev|MC|74|1998", "Ivaylo Yordanov|MC|75|1994", "Yordan Letchkov",
    "Krasimir Balakov", "Emil Kostadinov", "Hristo Stoichkov", "Lyuboslav Penev|DC|76|1998"] },
  { c: 'MEX', y: 1998, f: '3-5-2', p: [
    "Jorge Campos", "Claudio Suárez", "Duilio Davino|DFC|74|1998", "Raúl Lara|DFC|73|1998",
    "Pável Pardo|MD|75|1998", "Germán Villa|MCD|73|1998", "Alberto García Aspe", "Ramón Ramírez",
    "Cuauhtémoc Blanco|MCO|82|1998", "Luis Hernández|DC|81|1998", "Ricardo Peláez|DC|74|1998"] },
  { c: 'BEL', y: 1998, f: '4-4-2', p: [
    "Filip De Wilde|POR|76|1994", "Eric Deflandre|LD|74|1998", "Lorenzo Staelens", "Philippe Clement|DFC|74|1998",
    "Nico Van Kerckhoven|LI|74|1998", "Franky Van der Elst", "Marc Wilmots|MC|81|1990", "Enzo Scifo",
    "Gert Verheyen|MD|74|1998", "Danny Boffin", "Luc Nilis", "Emile Mpenza|DC|76|1998",
    "Mbo Mpenza|DC|74|1998"] },
  { c: 'KOR', y: 1998, f: '3-5-2', p: [
    "Kim Byung-ji|POR|72|1998", "Hong Myung-bo", "Lee Min-sung|DFC|70|1998", "Kim Tae-young",
    "Ha Seok-ju|MI|72|1994", "Seo Jung-won", "Yoo Sang-chul", "Ko Jong-soo|MCO|74|1998",
    "Choi Yong-soo|DC|74|1998", "Kim Do-hoon|DC|72|1998", "Lee Dong-gook|DC|70|1998"] },
  { c: 'GER', y: 1998, f: '3-5-2', p: [
    "Andreas Köpke|POR|83|1990", "Christian Wörns|DFC|79|1998", "Jürgen Kohler", "Lothar Matthäus",
    "Jörg Heinrich|MD|78|1998", "Dietmar Hamann", "Jens Jeremies|MCD|77|1998", "Andreas Möller",
    "Thomas Häßler", "Christian Ziege|LI|79|1998", "Olaf Thon|MC|79|1986", "Oliver Bierhoff|DC|84|1998",
    "Jürgen Klinsmann"] },
  { c: 'YUG', y: 1998, f: '4-4-2', p: [
    "Ivica Kralj|POR|75|1998", "Zoran Mirković|LD|74|1998", "Siniša Mihajlović|DFC|82|1998", "Miroslav Đukić|DFC|78|1998",
    "Goran Đorović|LI|74|1998", "Slaviša Jokanović|MCD|76|1998", "Albert Nađ|MCD|73|1998", "Vladimir Jugović|MC|80|1998",
    "Dejan Stanković|MC|76|1998", "Dragan Stojković", "Dejan Savićević", "Predrag Mijatović|DC|85|1998",
    "Savo Milošević|DC|80|1998"] },
  { c: 'IRN', y: 1998, f: '3-5-2', p: [
    "Ahmad Reza Abedzadeh|POR|72|1998", "Mohammad Khakpour|DFC|68|1998", "Mehdi Pashazadeh|DFC|67|1998", "Naeim Saadavi|DFC|66|1998",
    "Javad Zarincheh|LD|66|1998", "Nader Mohammadkhani|LI|67|1998", "Mehdi Mahdavikia|MD|75|1998", "Karim Bagheri|MC|75|1998",
    "Hamid Estili|MC|70|1998", "Khodadad Azizi|DC|75|1998", "Ali Daei|DC|78|1998"] },
  { c: 'USA', y: 1998, f: '3-5-2', p: [
    "Kasey Keller|POR|79|1990", "Eddie Pope", "Thomas Dooley", "Marcelo Balboa",
    "Jeff Agoos", "Frankie Hejduk", "Cobi Jones", "Claudio Reyna",
    "Tab Ramos", "Brian McBride", "Eric Wynalda", "Ernie Stewart|DC|73|1994"] },
  { c: 'ROU', y: 1998, f: '4-4-2', p: [
    "Bogdan Stelea|POR|77|1990", "Dan Petrescu", "Gheorghe Popescu", "Liviu Ciobotariu|DFC|72|1998",
    "Iulian Filipescu|DFC|74|1998", "Ioan Lupescu", "Constantin Gâlcă|MC|76|1994", "Dorinel Munteanu",
    "Gheorghe Hagi", "Adrian Ilie|DC|80|1998", "Viorel Moldovan|DC|78|1998"] },
  { c: 'COL', y: 1998, f: '3-5-2', p: [
    "Faryd Mondragón|POR|75|1994", "Wílmer Cabrera|DFC|72|1990", "Jorge Bermúdez|DFC|74|1998", "Éver Palacios|DFC|72|1998",
    "Mauricio Serna|MCD|74|1998", "Leonel Álvarez", "Freddy Rincón", "Harold Lozano|MC|74|1994",
    "Carlos Valderrama", "Faustino Asprilla", "Adolfo Valencia", "Léider Preciado|DC|74|1998"] },
  { c: 'TUN', y: 1998, f: '4-4-2', p: [
    "Chokri El Ouaer|POR|72|1998", "Sami Trabelsi|LD|68|1998", "Khaled Badra|DFC|68|1998", "Mounir Boukadida|DFC|66|1998",
    "José Clayton|LI|69|1998", "Riadh Bouazizi|MCD|67|1998", "Kaies Ghodhbane|MC|68|1998", "Zoubeir Baya|MC|72|1998",
    "Skander Souayah|MC|66|1998", "Adel Sellimi|DC|70|1998", "Mehdi Ben Slimane|DC|68|1998"] },
  { c: 'JPN', y: 1998, f: '3-5-2', p: [
    "Yoshikatsu Kawaguchi|POR|72|1998", "Masami Ihara|DFC|73|1998", "Yutaka Akita|DFC|70|1998", "Eisuke Nakanishi|DFC|68|1998",
    "Akira Narahashi|MD|68|1998", "Naoki Soma|MI|70|1998", "Motohiro Yamaguchi|MCD|70|1998", "Hiroshi Nanami|MC|72|1998",
    "Hidetoshi Nakata|MCO|81|1998", "Masashi Nakayama|DC|70|1998", "Shoji Jo|DC|70|1998", "Wagner Lopes|DC|69|1998"] },
  { c: 'POL', y: 2002, f: '4-4-2', p: [
    "Jerzy Dudek|POR|82|2002", "Tomasz Kłos|LD|73|2002", "Tomasz Hajto|DFC|74|2002", "Tomasz Wałdoch|DFC|75|2002",
    "Jacek Bąk|DFC|74|2002", "Michał Żewłakow|LI|72|2002", "Piotr Świerczewski|MCD|72|2002", "Radosław Kałużny|MC|72|2002",
    "Jacek Krzynówek|MI|74|2002", "Maciej Żurawski|DC|75|2002", "Emmanuel Olisadebe|DC|76|2002", "Paweł Kryszałowicz|DC|70|2002"] },
  { c: 'POR', y: 2002, f: '4-2-3-1', p: [
    "Vítor Baía|POR|84|2002", "Beto|DFC|75|2002", "Jorge Costa|DFC|79|2002", "Fernando Couto|DFC|81|2002",
    "Rui Jorge|LI|74|2002", "Paulo Bento|MCD|77|2002", "Petit|MC|74|2002", "Rui Costa|MCO|87|2002",
    "Luís Figo", "João Pinto|MCO|82|2002", "Sérgio Conceição|MD|80|2002", "Pauleta",
    "Nuno Gomes|DC|78|2002"] },
  { c: 'JPN', y: 2002, f: '3-5-2', p: [
    "Seigo Narazaki|POR|72|1998", "Tsuneyasu Miyamoto|DFC|72|2002", "Ryuzo Morioka|DFC|71|2002", "Naoki Matsuda|DFC|71|2002",
    "Daisuke Ichikawa|MD|69|2002", "Alessandro Santos|MI|72|2002", "Kazuyuki Toda|MCD|72|2002", "Junichi Inamoto|MC|77|2002",
    "Hidetoshi Nakata", "Shinji Ono|MC|78|1998", "Atsushi Yanagisawa|DC|72|2002", "Takayuki Suzuki|DC|70|2002"] },
  { c: 'BEL', y: 2002, f: '4-4-2', p: [
    "Geert De Vlieger|POR|76|2002", "Jacky Peeters|LD|72|2002", "Daniel Van Buyten|DFC|77|2002", "Eric Van Meir|DFC|72|2002",
    "Nico Van Kerckhoven", "Yves Vanderhaeghe|MCD|74|2002", "Timmy Simons|MCD|74|2002", "Johan Walem|MC|76|2002",
    "Gert Verheyen", "Bart Goor|MI|76|2002", "Marc Wilmots", "Wesley Sonck|DC|74|2002",
    "Mbo Mpenza"] },
  { c: 'RUS', y: 2002, f: '4-4-2', p: [
    "Ruslan Nigmatullin|POR|77|2002", "Dmitri Sennikov|LD|70|2002", "Viktor Onopko|DFC|79|1994", "Yuri Kovtun|DFC|73|2002",
    "Igor Chugainov|DFC|70|2002", "Aleksei Smertin|MCD|77|2002", "Egor Titov|MCO|79|2002", "Valery Karpin|MD|79|1994",
    "Dmitri Alenichev|MC|77|2002", "Marat Izmailov|MI|72|2002", "Vladimir Beschastnykh", "Dmitri Sychev|DC|74|2002"] },
  { c: 'TUN', y: 2002, f: '4-4-2', p: [
    "Ali Boumnijel|POR|68|2002", "Hatem Trabelsi|LD|72|2002", "Khaled Badra", "Radhi Jaïdi|DFC|70|2002",
    "José Clayton", "Riadh Bouazizi", "Hassen Gabsi|MC|67|2002", "Kaies Ghodhbane",
    "Zoubeir Baya", "Selim Benachour|MC|66|2002", "Ziad Jaziri|DC|68|2002"] },
  { c: 'FRA', y: 2002, f: '4-2-3-1', p: [
    "Fabien Barthez", "Lilian Thuram", "Marcel Desailly", "Frank Leboeuf|DFC|79|1998",
    "Bixente Lizarazu", "Patrick Vieira", "Emmanuel Petit", "Claude Makélélé",
    "Zinedine Zidane", "Youri Djorkaeff", "Sylvain Wiltord|ED|81|1998", "Thierry Henry",
    "David Trezeguet"] },
  { c: 'URU', y: 2002, f: '4-4-2', p: [
    "Fabián Carini|POR|76|2002", "Paolo Montero|DFC|82|2002", "Alejandro Lembo|DFC|72|2002", "Gonzalo Sorondo|DFC|72|2002",
    "Darío Rodríguez|LI|76|2002", "Pablo García|MCD|74|2002", "Gustavo Varela|MC|73|2002", "Fabián O'Neill|MCO|78|2002",
    "Álvaro Recoba|MCO|83|2002", "Diego Forlán", "Darío Silva|DC|77|2002", "Richard Morales|DC|74|2002"] },
  { c: 'DEN', y: 2002, f: '4-3-3', p: [
    "Thomas Sørensen|POR|77|2002", "Thomas Helveg", "René Henriksen|DFC|74|2002", "Martin Laursen|DFC|77|2002",
    "Niclas Jensen|LI|74|2002", "Stig Tøfting|MCD|75|2002", "Thomas Gravesen|MC|78|2002", "Martin Jørgensen",
    "Dennis Rommedahl|ED|79|2002", "Jesper Grønkjær|EI|79|2002", "Jon Dahl Tomasson|DC|82|1998", "Ebbe Sand"] },
  { c: 'ESP', y: 2002, f: '4-4-2', p: [
    "Iker Casillas", "Carles Puyol", "Fernando Hierro", "Miguel Ángel Nadal",
    "Juanfran|LI|75|2002", "Rubén Baraja|MC|79|2002", "Xavi", "Juan Carlos Valerón|MCO|82|2002",
    "Luis Enrique", "Joaquín|ED|79|2002", "De Pedro|MI|76|2002", "Raúl",
    "Fernando Morientes"] },
  { c: 'PAR', y: 2002, f: '4-4-2', p: [
    "José Luis Chilavert", "Francisco Arce", "Carlos Gamarra", "Celso Ayala",
    "Julio César Cáceres|DFC|72|2002", "Denis Caniza", "Carlos Paredes", "Roberto Acuña",
    "Estanislao Struway|MC|72|2002", "Jorge Luis Campos", "Nelson Cuevas|DC|75|2002", "José Cardozo",
    "Roque Santa Cruz|DC|79|2002"] },
  { c: 'RSA', y: 2002, f: '4-4-2', p: [
    "Andre Arendse|POR|72|2002", "Lucas Radebe", "Aaron Mokoena|DFC|72|2002", "Pierre Issa",
    "Bradley Carnell|LI|70|2002", "MacBeth Sibaya|MCD|70|2002", "Teboho Mokoena|MC|70|2002", "Quinton Fortune",
    "Delron Buckley|MI|71|2002", "Sibusiso Zuma|DC|74|2002", "Benni McCarthy", "Siyabonga Nomvete|DC|70|2002"] },
  { c: 'SVN', y: 2002, f: '4-4-2', p: [
    "Marko Simeunovič|POR|70|2002", "Muamer Vugdalić|DFC|67|2002", "Željko Milinovič|DFC|68|2002", "Aleksander Knavs|DFC|70|2002",
    "Amir Karić|LI|68|2002", "Džoni Novak|MCD|69|2002", "Aleš Čeh|MC|70|2002", "Miran Pavlin|MC|71|2002",
    "Milenko Ačimovič|MC|71|2002", "Zlatko Zahovič|MCO|79|2002", "Mladen Rudonja|EI|67|2002", "Milan Osterc|DC|68|2002",
    "Sebastjan Cimirotič|DC|68|2002"] },
  { c: 'CRC', y: 2002, f: '3-5-2', p: [
    "Erick Lonnis|POR|73|2002", "Harold Wallace|LD|68|2002", "Luis Marín|DFC|72|2002", "Gilberto Martínez|DFC|70|2002",
    "Mauricio Wright|DFC|70|2002", "Mauricio Solís|MCD|70|2002", "Wilmer López|MC|71|2002", "Walter Centeno|MCO|74|2002",
    "Ronald Gómez|DC|72|2002", "Rolando Fonseca|DC|72|2002", "Paulo Wanchope|DC|79|2002", "Winston Parks|DC|68|2002"] },
  { c: 'IRL', y: 2002, f: '4-4-2', p: [
    "Shay Given|POR|80|2002", "Steve Finnan|LD|76|2002", "Gary Breen|DFC|74|2002", "Steve Staunton",
    "Ian Harte|LI|75|2002", "Jason McAteer", "Matt Holland|MC|74|2002", "Mark Kinsella|MC|73|2002",
    "Kevin Kilbane|MI|74|2002", "Damien Duff|ED|81|2002", "Robbie Keane|DC|82|2002", "Niall Quinn"] },
  { c: 'CMR', y: 2002, f: '4-4-2', p: [
    "Boukar Alioum|POR|72|2002", "Bill Tchato|LD|70|2002", "Rigobert Song", "Raymond Kalla",
    "Pierre Womé", "Lauren", "Marc-Vivien Foé", "Geremi|MC|78|2002",
    "Salomon Olembé", "Patrick Mboma", "Samuel Eto'o"] },
  { c: 'KSA', y: 2002, f: '4-4-2', p: [
    "Mohamed Al-Deayea", "Redha Tukar|DFC|66|2002", "Ahmed Al-Dokhi", "Abdullah Zubromawi",
    "Hussein Abdulghani", "Mohammed Noor|MC|70|2002", "Abdulaziz Khathran|MC|66|2002", "Nawaf Al-Temyat|MCO|72|2002",
    "Mohammed Al-Shalhoub|MCO|70|2002", "Sami Al-Jaber", "Obeid Al-Dosari"] },
  { c: 'SUE', y: 2002, f: '4-4-2', p: [
    "Magnus Hedman|POR|78|2002", "Teddy Lučić|LD|74|2002", "Olof Mellberg|DFC|81|2002", "Johan Mjällby|DFC|79|2002",
    "Erik Edman|LI|75|2002", "Niclas Alexandersson|MD|76|2002", "Tobias Linderoth|MCD|75|2002", "Anders Svensson|MC|75|2002",
    "Fredrik Ljungberg|MI|84|2002", "Henrik Larsson", "Marcus Allbäck|DC|75|2002", "Zlatan Ibrahimović|DC|75|2002"] },
  { c: 'ING', y: 2002, f: '4-4-2', p: [
    "David Seaman", "Danny Mills|LD|74|2002", "Rio Ferdinand|DFC|85|1998", "Sol Campbell",
    "Ashley Cole|LI|80|2002", "David Beckham", "Nicky Butt|MCD|80|2002", "Owen Hargreaves|MC|76|2002",
    "Paul Scholes", "Trevor Sinclair|MI|75|2002", "Michael Owen", "Emile Heskey|DC|77|2002",
    "Teddy Sheringham"] },
  { c: 'ARG', y: 2002, f: '3-5-2', p: [
    "Pablo Cavallero|POR|78|2002", "Mauricio Pochettino|DFC|80|2002", "Walter Samuel", "Javier Zanetti",
    "Juan Pablo Sorín", "Diego Simeone", "Juan Sebastián Verón", "Kily González|MI|80|2002",
    "Ariel Ortega", "Pablo Aimar|MCO|84|2002", "Claudio López", "Gabriel Batistuta",
    "Hernán Crespo"] },
  { c: 'NGA', y: 2002, f: '4-4-2', p: [
    "Vincent Enyeama|POR|70|2002", "Joseph Yobo|DFC|74|2002", "Taribo West", "Isaac Okoronkwo|DFC|70|2002",
    "Ifeanyi Udeze|LI|70|2002", "Justice Christopher|MC|70|2002", "Garba Lawal", "Jay-Jay Okocha",
    "Nwankwo Kanu", "Julius Aghahowa|DC|76|2002", "Bartholomew Ogbeche|DC|70|2002"] },
  { c: 'ITA', y: 2002, f: '4-4-2', p: [
    "Gianluigi Buffon", "Christian Panucci|LD|80|2002", "Fabio Cannavaro", "Alessandro Nesta",
    "Paolo Maldini", "Gianluca Zambrotta", "Damiano Tommasi|MC|77|2002", "Luigi Di Biagio",
    "Gennaro Gattuso", "Francesco Totti", "Alessandro Del Piero", "Christian Vieri",
    "Filippo Inzaghi|DC|84|1998"] },
  { c: 'MEX', y: 2002, f: '3-5-2', p: [
    "Óscar Pérez|POR|75|1998", "Rafael Márquez|DFC|83|2002", "Manuel Vidrio|DFC|73|2002", "Gabriel de Anda|DFC|71|2002",
    "Salvador Carmona|MD|73|2002", "Ramón Morales|MI|73|2002", "Gerardo Torrado|MCD|74|2002", "Johan Rodríguez|MC|72|2002",
    "Jesús Arellano|ED|75|1998", "Cuauhtémoc Blanco", "Jared Borgetti|DC|79|2002"] },
  { c: 'CRO', y: 2002, f: '3-5-2', p: [
    "Stipe Pletikosa|POR|79|2002", "Boris Živković|LD|75|2002", "Robert Kovač|DFC|79|2002", "Dario Šimić",
    "Robert Jarni", "Zvonimir Soldo|MCD|77|1998", "Niko Kovač|MC|80|2002", "Milan Rapaić|MD|76|2002",
    "Robert Prosinečki", "Alen Bokšić|DC|81|2002", "Ivica Olić|DC|76|2002", "Davor Šuker"] },
  { c: 'ECU', y: 2002, f: '4-4-2', p: [
    "José Francisco Cevallos|POR|72|2002", "Ulises de la Cruz|LD|72|2002", "Iván Hurtado|DFC|75|2002", "Giovanny Espinoza|DFC|70|2002",
    "Raúl Guerrón|LI|68|2002", "Edwin Tenorio|MCD|70|2002", "Marlon Ayoví|MC|68|2002", "Cléber Chalá|MD|71|2002",
    "Edison Méndez|MI|72|2002", "Álex Aguinaga|MCO|76|2002", "Agustín Delgado|DC|75|2002", "Iván Kaviedes|DC|72|2002"] },
  { c: 'CRC', y: 2006, f: '4-4-2', p: [
    "José Porras|POR|70|2006", "Harold Wallace", "Luis Marín", "Michael Umaña",
    "Gilberto Martínez", "Leonardo González|LI|69|2006", "Danny Fonseca|MCD|68|2006", "Mauricio Solís",
    "Walter Centeno", "Christian Bolaños", "Ronald Gómez", "Paulo Wanchope"] },
  { c: 'POL', y: 2006, f: '4-4-2', p: [
    "Artur Boruc|POR|79|2006", "Marcin Baszczyński|LD|71|2006", "Jacek Bąk", "Mariusz Jop|DFC|70|2006",
    "Michał Żewłakow", "Jacek Krzynówek", "Mariusz Lewandowski|MCD|73|2006", "Radosław Sobolewski|MC|72|2006",
    "Euzebiusz Smolarek|MI|76|2006", "Kamil Kosowski|MI|72|2002", "Maciej Żurawski", "Paweł Brożek|DC|70|2006",
    "Arkadiusz Radomski|MCD|70|2006"] },
  { c: 'ECU', y: 2006, f: '4-4-2', p: [
    "Cristian Mora|POR|72|2006", "Ulises de la Cruz", "Iván Hurtado", "Giovanny Espinoza",
    "Néicer Reasco|LI|71|2006", "Antonio Valencia|MD|79|2006", "Edwin Tenorio", "Segundo Castillo|MC|72|2006",
    "Edison Méndez", "Christian Lara|MCO|70|2006", "Agustín Delgado", "Carlos Tenorio|DC|74|2006"] },
  { c: 'ING', y: 2006, f: '4-4-2', p: [
    "Paul Robinson|POR|80|2006", "Gary Neville", "Rio Ferdinand", "John Terry|DFC|87|2006",
    "Ashley Cole", "David Beckham", "Owen Hargreaves", "Frank Lampard|MC|87|2006",
    "Steven Gerrard|MC|88|2006", "Joe Cole|MI|82|2002", "Wayne Rooney|DC|88|2006", "Michael Owen",
    "Peter Crouch|DC|78|2006"] },
  { c: 'PAR', y: 2006, f: '4-4-2', p: [
    "Justo Villar|POR|76|2006", "Denis Caniza", "Carlos Gamarra", "Julio César Cáceres",
    "Paulo da Silva|DFC|75|2006", "Delio Toledo|LI|70|2002", "Carlos Paredes", "Roberto Acuña",
    "Edgar Barreto|MC|73|2006", "Julio dos Santos|MCO|72|2006", "Roque Santa Cruz", "Nelson Haedo Valdez|DC|76|2006",
    "Nelson Cuevas"] },
  { c: 'TRI', y: 2006, f: '4-4-2', p: [
    "Shaka Hislop|POR|74|2006", "Cyd Gray|LD|62|2006", "Dennis Lawrence|DFC|67|2006", "Brent Sancho|DFC|64|2006",
    "Avery John|LI|63|2006", "Carlos Edwards|MD|68|2006", "Chris Birchall|MC|65|2006", "Densill Theobald|MC|63|2006",
    "Dwight Yorke|MC|79|2006", "Russell Latapy|MCO|70|2006", "Stern John|DC|70|2006", "Kenwyne Jones|DC|68|2006"] },
  { c: 'SUE', y: 2006, f: '4-4-2', p: [
    "Andreas Isaksson|POR|79|2002", "Niclas Alexandersson", "Olof Mellberg", "Petter Hansson|DFC|73|2006",
    "Teddy Lučić", "Erik Edman", "Christian Wilhelmsson|MD|75|2006", "Tobias Linderoth",
    "Kim Källström|MC|77|2006", "Fredrik Ljungberg", "Zlatan Ibrahimović", "Henrik Larsson",
    "Marcus Allbäck"] },
  { c: 'CIV', y: 2006, f: '4-4-2', p: [
    "Jean-Jacques Tizié|POR|71|2006", "Emmanuel Eboué|LD|78|2006", "Kolo Touré|DFC|84|2006", "Abdoulaye Méïté|DFC|75|2006",
    "Arthur Boka|LI|75|2006", "Didier Zokora|MCD|79|2006", "Yaya Touré|MC|86|2006", "Gilles Yapi Yapo|MC|73|2006",
    "Bonaventure Kalou|ED|76|2006", "Aruna Dindane|DC|77|2006", "Didier Drogba|DC|89|2006", "Arouna Koné|DC|77|2006"] },
  { c: 'SCG', y: 2006, f: '4-4-2', p: [
    "Dragoslav Jevrić|POR|72|2006", "Nenad Đorđević|LD|70|2006", "Goran Gavrančić|DFC|72|2006", "Mladen Krstajić|DFC|78|2006",
    "Ivica Dragutinović|LI|74|2006", "Igor Duljaj|MCD|72|2006", "Dejan Stanković", "Albert Nađ",
    "Ognjen Koroman|MD|72|2006", "Predrag Đorđević|MI|72|2006", "Savo Milošević", "Mateja Kežman|DC|79|2006",
    "Nikola Žigić|DC|75|2006"] },
  { c: 'NED', y: 2006, f: '4-3-3', p: [
    "Edwin van der Sar", "Khalid Boulahrouz|LD|76|2006", "André Ooijer|DFC|75|1998", "Joris Mathijsen",
    "Giovanni van Bronckhorst", "Mark van Bommel", "Phillip Cocu", "Wesley Sneijder",
    "Rafael van der Vaart", "Arjen Robben", "Ruud van Nistelrooy|DC|88|2006", "Robin van Persie",
    "Dirk Kuyt"] },
  { c: 'MEX', y: 2006, f: '3-5-2', p: [
    "Oswaldo Sánchez|POR|78|1998", "Ricardo Osorio|DFC|74|2006", "Rafael Márquez", "Carlos Salcido|DFC|76|2006",
    "Pável Pardo", "Gerardo Torrado", "Zinha|MCO|74|2006", "Ramón Morales",
    "Andrés Guardado", "Jared Borgetti", "Omar Bravo|DC|75|2006", "Francisco Fonseca|DC|74|2006"] },
  { c: 'IRN', y: 2006, f: '4-4-2', p: [
    "Ebrahim Mirzapour|POR|70|2006", "Hossein Kaebi|LD|68|2006", "Rahman Rezaei|DFC|70|2006", "Yahya Golmohammadi|DFC|67|2006",
    "Mohammad Nosrati|DFC|66|2006", "Andranik Teymourian|MC|68|2006", "Javad Nekounam|MC|72|2006", "Mehdi Mahdavikia",
    "Ferydoon Zandi|MI|69|2006", "Ali Karimi|MCO|76|2006", "Ali Daei", "Vahid Hashemian|DC|71|2006"] },
  { c: 'ANG', y: 2006, f: '4-4-2', p: [
    "João Ricardo|POR|67|2006", "Locó|LD|62|2006", "Kali|DFC|64|2006", "Jamba|DFC|63|2006",
    "Delgado|LI|61|2006", "André Macanga|MCD|63|2006", "Figueiredo|MC|65|2006", "Mendonça|MC|62|2006",
    "Zé Kalanga|ED|65|2006", "Akwá|DC|66|2006", "Mantorras|DC|67|2006", "Flávio|DC|65|2006"] },
  { c: 'GHA', y: 2006, f: '4-4-2', p: [
    "Richard Kingson", "John Paintsil", "John Mensah", "Samuel Kuffour|DFC|79|2006",
    "Shilla Illiasu|DFC|70|2006", "Emmanuel Pappoe|LI|70|2006", "Michael Essien|MC|87|2006", "Stephen Appiah|MC|80|2006",
    "Sulley Muntari", "Haminu Draman|MD|73|2006", "Asamoah Gyan", "Matthew Amoah|DC|72|2006"] },
  { c: 'USA', y: 2006, f: '4-4-2', p: [
    "Kasey Keller", "Steve Cherundolo|LD|74|2006", "Oguchi Onyewu|DFC|75|2006", "Eddie Pope",
    "Carlos Bocanegra|LI|75|2006", "Claudio Reyna", "Pablo Mastroeni", "John O'Brien",
    "Clint Dempsey|MD|78|2006", "DaMarcus Beasley", "Eddie Lewis|MI|72|2002", "Landon Donovan",
    "Brian McBride"] },
  { c: 'CZE', y: 2006, f: '4-4-2', p: [
    "Petr Čech|POR|89|2006", "Zdeněk Grygera|LD|77|2006", "Tomáš Ujfaluši|DFC|78|2006", "David Rozehnal|DFC|76|2006",
    "Marek Jankulovski|LI|79|2006", "Tomáš Galásek|MCD|77|2006", "Jaroslav Plašil|MC|75|2006", "Karel Poborský|MD|80|2006",
    "Tomáš Rosický|MCO|85|2006", "Pavel Nedvěd|MI|90|2006", "Jan Koller|DC|80|2006", "Milan Baroš|DC|80|2006",
    "Vratislav Lokvenc|DC|72|2006"] },
  { c: 'CRO', y: 2006, f: '4-4-2', p: [
    "Stipe Pletikosa", "Darijo Srna|LD|81|2006", "Robert Kovač", "Josip Šimunić|DFC|77|2002",
    "Igor Tudor|DFC|76|1998", "Dario Šimić", "Niko Kovač", "Marko Babić|MI|74|2006",
    "Niko Kranjčar|MCO|80|2006", "Luka Modrić", "Ivan Klasnić|DC|76|2006", "Dado Pršo|DC|78|2006"] },
  { c: 'AUS', y: 2006, f: '4-4-2', p: [
    "Mark Schwarzer|POR|80|2006", "Luke Wilkshire|LD|71|2006", "Lucas Neill|DFC|77|2006", "Craig Moore|DFC|75|2006",
    "Scott Chipperfield|LI|73|2006", "Brett Emerton|MD|75|2006", "Vince Grella|MCD|75|2006", "Jason Culina|MC|73|2006",
    "Mark Bresciano|MC|76|2006", "Tim Cahill|MCO|80|2006", "Harry Kewell|EI|81|2006", "Mark Viduka|DC|80|2006",
    "John Aloisi|DC|72|2006"] },
  { c: 'JPN', y: 2006, f: '4-4-2', p: [
    "Yoshikatsu Kawaguchi", "Akira Kaji|LD|72|2006", "Tsuneyasu Miyamoto", "Yūji Nakazawa|DFC|75|2006",
    "Alessandro Santos", "Takashi Fukunishi|MCD|73|2002", "Hidetoshi Nakata", "Mitsuo Ogasawara|MC|74|2002",
    "Shunsuke Nakamura|MCO|82|2006", "Yasuhito Endō|MC|78|2006", "Naohiro Takahara|DC|74|2006", "Atsushi Yanagisawa",
    "Keiji Tamada|DC|72|2006"] },
  { c: 'SUI', y: 2006, f: '4-4-2', p: [
    "Pascal Zuberbühler|POR|74|2006", "Philipp Degen|LD|72|2006", "Patrick Müller|DFC|76|2006", "Philippe Senderos|DFC|77|2006",
    "Ludovic Magnin|LI|73|2006", "Johann Vogel|MCD|76|2006", "Raphaël Wicky|MC|73|2006", "Tranquillo Barnetta|MD|76|2006",
    "Ricardo Cabanas|MC|73|2006", "Valon Behrami|MD|74|2006", "Hakan Yakin|MCO|75|2006", "Alexander Frei|DC|80|2006",
    "Marco Streller|DC|73|2006"] },
  { c: 'KOR', y: 2006, f: '4-3-3', p: [
    "Lee Woon-jae", "Lee Young-pyo", "Kim Young-chul|DFC|70|2006", "Choi Jin-cheul",
    "Kim Dong-jin|LI|70|2006", "Kim Nam-il", "Lee Eul-yong|MC|72|2002", "Lee Ho|MC|68|2006",
    "Park Ji-sung", "Lee Chun-soo|ED|74|2002", "Seol Ki-hyeon", "Cho Jae-jin|DC|72|2006",
    "Ahn Jung-hwan"] },
  { c: 'TOG', y: 2006, f: '4-4-2', p: [
    "Kossi Agassa|POR|66|2006", "Massamasso Tchangaï|LD|61|2006", "Jean-Paul Abalo|DFC|64|2006", "Daré Nibombé|DFC|62|2006",
    "Assimiou Touré|LI|62|2006", "Alaixys Romao|MCD|65|2006", "Yao Junior Sénaya|MC|64|2006", "Moustapha Salifou|MC|65|2006",
    "Cherif Touré Mamam|MCO|66|2006", "Thomas Dossevi|ED|63|2006", "Emmanuel Adebayor|DC|80|2006", "Kader Coubadja|DC|64|2006"] },
  { c: 'ESP', y: 2006, f: '4-3-3', p: [
    "Iker Casillas", "Sergio Ramos", "Carles Puyol", "Pablo Ibáñez|DFC|76|2006",
    "Mariano Pernía|LI|75|2006", "Marcos Senna|MCD|80|2006", "Xabi Alonso", "Xavi",
    "Cesc Fàbregas|MC|85|2006", "Andrés Iniesta", "Raúl", "David Villa",
    "Fernando Torres"] },
  { c: 'UKR', y: 2006, f: '4-4-2', p: [
    "Oleksandr Shovkovskyi|POR|78|2006", "Vladyslav Vashchuk|DFC|72|2006", "Andriy Rusol|DFC|72|2006", "Volodymyr Yezerskyi|DFC|70|2006",
    "Andriy Nesmachnyi|LI|73|2006", "Oleh Husyev|MD|74|2006", "Anatoliy Tymoshchuk|MCD|79|2006", "Oleh Shelayev|MC|72|2006",
    "Andriy Husin|MC|72|2006", "Maksym Kalynychenko|MI|74|2006", "Andriy Shevchenko|DC|90|2006", "Andriy Voronin|DC|78|2006",
    "Artem Milevskyi|DC|72|2006"] },
  { c: 'TUN', y: 2006, f: '4-4-2', p: [
    "Ali Boumnijel", "Hatem Trabelsi", "Radhi Jaïdi", "Karim Haggui|DFC|71|2006",
    "David Jemmali|LI|68|2006", "Riadh Bouazizi", "Jawhar Mnari|MC|70|2006", "Adel Chedli|MC|70|2006",
    "Kaies Ghodhbane", "Selim Benachour", "Ziad Jaziri", "Francileudo Santos|DC|72|2006"] },
  { c: 'KSA', y: 2006, f: '4-4-2', p: [
    "Mabrouk Zaid|POR|68|2002", "Ahmed Dukhi|LD|64|2006", "Hamad Al-Montashari|DFC|68|2006", "Redha Tukar",
    "Hussein Sulimani|LI|67|1998", "Saud Kariri|MCD|66|2006", "Mohammad Noor|MC|67|2002", "Khaled Aziz|MC|64|2006",
    "Mohammed Al-Shalhoub", "Yasser Al-Qahtani|DC|69|2006", "Sami Al-Jaber", "Malek Mouath|DC|64|2006"] },
  { c: 'RSA', y: 2010, f: '4-2-3-1', p: [
    "Itumeleng Khune|POR|72|2010", "Siboniso Gaxa|LD|66|2010", "Aaron Mokoena", "Bongani Khumalo|DFC|66|2010",
    "Tsepo Masilela|LI|67|2010", "Lucas Thwala|LI|64|2010", "MacBeth Sibaya", "Kagisho Dikgacoi|MC|67|2010",
    "Siphiwe Tshabalala|MI|71|2010", "Steven Pienaar|MCO|76|2002", "Teko Modise|MD|69|2010", "Katlego Mphela|DC|68|2010",
    "Bernard Parker|DC|66|2010"] },
  { c: 'MEX', y: 2010, f: '4-3-3', p: [
    "Óscar Pérez", "Paul Aguilar|LD|72|2010", "Francisco Javier Rodríguez|DFC|74|2010", "Rafael Márquez",
    "Héctor Moreno", "Carlos Salcido", "Gerardo Torrado", "Andrés Guardado",
    "Cuauhtémoc Blanco", "Giovani dos Santos|ED|79|2010", "Carlos Vela|EI|77|2010", "Javier Hernández|DC|80|2010",
    "Guillermo Franco|DC|73|2010"] },
  { c: 'FRA', y: 2010, f: '4-3-3', p: [
    "Hugo Lloris", "Bacary Sagna|LD|80|2010", "William Gallas", "Éric Abidal",
    "Patrice Evra|LI|83|2010", "Jérémy Toulalan|MCD|79|2010", "Abou Diaby|MC|77|2010", "Florent Malouda",
    "Yoann Gourcuff|MCO|81|2010", "Franck Ribéry", "Sidney Govou|ED|76|2006", "Nicolas Anelka|DC|82|2010",
    "Thierry Henry"] },
  { c: 'NGA', y: 2010, f: '4-4-2', p: [
    "Vincent Enyeama", "Chidi Odiah|LD|67|2010", "Joseph Yobo", "Danny Shittu|DFC|72|2010",
    "Taye Taiwo|LI|74|2010", "Dickson Etuhu|MCD|71|2010", "Sani Kaita|MC|68|2010", "Lukman Haruna|MC|69|2010",
    "Kalu Uche|MI|72|2002", "Peter Odemwingie|ED|73|2010", "Yakubu|DC|76|2010", "Obafemi Martins|DC|76|2010",
    "Nwankwo Kanu"] },
  { c: 'KOR', y: 2010, f: '4-4-2', p: [
    "Jung Sung-ryong|POR|72|2010", "Cha Du-ri|LD|74|2002", "Lee Jung-soo|DFC|73|2010", "Cho Yong-hyung|DFC|71|2010",
    "Lee Young-pyo", "Lee Chung-yong|MD|76|2010", "Ki Sung-yueng|MC|76|2010", "Kim Jung-woo|MCD|72|2010",
    "Park Ji-sung", "Yeom Ki-hun|MI|71|2010", "Park Chu-young|DC|76|2006", "Ahn Jung-hwan"] },
  { c: 'GRE', y: 2010, f: '4-3-3', p: [
    "Alexandros Tzorvas|POR|72|2010", "Georgios Seitaridis|LD|73|2010", "Sotirios Kyrgiakos|DFC|74|2010", "Avraam Papadopoulos|DFC|72|2010",
    "Vangelis Moras|DFC|70|2010", "Vasilis Torosidis|LI|75|2010", "Kostas Katsouranis|MCD|76|2010", "Giorgos Karagounis|MC|78|2010",
    "Alexandros Tziolis|MC|72|2010", "Sotiris Ninis|MCO|70|2010", "Dimitris Salpingidis|ED|73|2010", "Georgios Samaras|DC|74|2010",
    "Theofanis Gekas|DC|74|2010"] },
  { c: 'ING', y: 2010, f: '4-4-2', p: [
    "David James|POR|78|2002", "Glen Johnson|LD|79|2010", "John Terry", "Jamie Carragher|DFC|81|2006",
    "Matthew Upson|DFC|76|2010", "Ashley Cole", "James Milner|MD|78|2010", "Gareth Barry|MCD|79|2010",
    "Frank Lampard", "Steven Gerrard", "Wayne Rooney", "Jermain Defoe|DC|79|2010",
    "Emile Heskey"] },
  { c: 'USA', y: 2010, f: '4-4-2', p: [
    "Tim Howard|POR|81|2006", "Steve Cherundolo", "Jay DeMerit|DFC|72|2010", "Oguchi Onyewu",
    "Carlos Bocanegra", "Landon Donovan", "Michael Bradley|MC|77|2010", "Ricardo Clark|MCD|71|2010",
    "Maurice Edu|MCD|72|2010", "Clint Dempsey", "Jozy Altidore|DC|75|2010", "Herculez Gomez|DC|70|2010"] },
  { c: 'ALG', y: 2010, f: '3-5-2', p: [
    "Raïs M'Bolhi|POR|73|2010", "Madjid Bougherra|DFC|75|2010", "Antar Yahia|DFC|72|2010", "Rafik Halliche|DFC|71|2010",
    "Foued Kadir|MD|70|2010", "Nadir Belhadj|LI|72|2010", "Mehdi Lacen|MCD|70|2010", "Hassan Yebda|MC|71|2010",
    "Karim Ziani|MCO|73|2010", "Ryad Boudebouz|MCO|68|2010", "Karim Matmour|ED|70|2010", "Rafik Djebbour|DC|69|2010",
    "Abdelkader Ghezzal|DC|68|2010"] },
  { c: 'SVN', y: 2010, f: '4-4-2', p: [
    "Samir Handanović|POR|80|2010", "Mišo Brečko|LD|70|2010", "Boštjan Cesar|DFC|71|2010", "Marko Šuler|DFC|69|2010",
    "Bojan Jokić|LI|69|2010", "Valter Birsa|MD|72|2010", "Aleksander Radosavljević|MCD|67|2010", "Robert Koren|MC|72|2010",
    "Andraž Kirm|MI|69|2010", "Milivoje Novakovič|DC|72|2010", "Zlatan Ljubijankić|DC|68|2010", "Zlatko Dedič|DC|67|2010"] },
  { c: 'AUS', y: 2010, f: '4-2-3-1', p: [
    "Mark Schwarzer", "Luke Wilkshire", "Lucas Neill", "Craig Moore",
    "David Carney|LI|70|2010", "Jason Culina", "Carl Valeri|MCD|70|2010", "Brett Emerton",
    "Tim Cahill", "Brett Holman|MCO|72|2010", "Harry Kewell", "Mark Bresciano",
    "Joshua Kennedy|DC|71|2010"] },
  { c: 'SRB', y: 2010, f: '4-4-2', p: [
    "Vladimir Stojković|POR|74|2010", "Branislav Ivanović|LD|82|2010", "Nemanja Vidić|DFC|88|2010", "Neven Subotić|DFC|79|2010",
    "Aleksandar Kolarov|LI|79|2010", "Miloš Krasić|MD|77|2010", "Dejan Stanković", "Nenad Milijaš|MC|73|2010",
    "Gojko Kačar|MC|72|2010", "Zoran Tošić|MI|74|2010", "Milan Jovanović|EI|77|2010", "Nikola Žigić",
    "Marko Pantelić|DC|73|2010"] },
  { c: 'DEN', y: 2010, f: '4-3-3', p: [
    "Thomas Sørensen", "Lars Jacobsen|LD|72|2010", "Daniel Agger|DFC|80|2010", "Simon Kjær|DFC|78|2010",
    "Simon Poulsen|LI|71|2010", "Christian Poulsen|MCD|78|2002", "Daniel Jensen|MC|72|2010", "Thomas Kahlenberg|MC|72|2010",
    "Dennis Rommedahl", "Jesper Grønkjær", "Nicklas Bendtner|DC|76|2010", "Jon Dahl Tomasson"] },
  { c: 'JPN', y: 2010, f: '4-2-3-1', p: [
    "Eiji Kawashima|POR|77|2010", "Yūichi Komano|LD|71|2006", "Yūji Nakazawa", "Marcus Tulio Tanaka|DFC|75|2010",
    "Yūto Nagatomo|LI|76|2010", "Yūki Abe|MCD|72|2010", "Makoto Hasebe|MC|76|2010", "Yasuhito Endō",
    "Daisuke Matsui|MD|73|2010", "Keisuke Honda|MCO|81|2010", "Yoshito Ōkubo|EI|73|2010", "Shunsuke Nakamura",
    "Shinji Okazaki|DC|74|2010"] },
  { c: 'CMR', y: 2010, f: '4-3-3', p: [
    "Hamidou Souleymanou|POR|70|2010", "Stéphane Mbia|DFC|76|2010", "Rigobert Song", "Nicolas N'Koulou|DFC|74|2010",
    "Benoît Assou-Ekotto|LI|74|2010", "Alexandre Song|MCD|78|2010", "Jean Makoun|MC|74|2010", "Achille Emaná|MC|72|2010",
    "Geremi", "Samuel Eto'o", "Eric Maxim Choupo-Moting|EI|72|2010", "Pierre Webó|DC|71|2010"] },
  { c: 'ITA', y: 2010, f: '4-4-2', p: [
    "Gianluigi Buffon", "Gianluca Zambrotta", "Fabio Cannavaro", "Giorgio Chiellini|DFC|85|2010",
    "Domenico Criscito|LI|74|2010", "Daniele De Rossi", "Riccardo Montolivo|MC|77|2010", "Andrea Pirlo",
    "Claudio Marchisio|MC|80|2010", "Simone Pepe|MD|74|2010", "Vincenzo Iaquinta|DC|77|2006", "Antonio Di Natale|DC|82|2010",
    "Fabio Quagliarella|DC|78|2010"] },
  { c: 'PAR', y: 2010, f: '4-4-2', p: [
    "Justo Villar", "Carlos Bonet|LD|72|2006", "Paulo da Silva", "Antolín Alcaraz|DFC|73|2010",
    "Claudio Morel Rodríguez|LI|72|2010", "Víctor Cáceres|MCD|73|2010", "Cristian Riveros|MC|74|2010", "Enrique Vera|MC|72|2010",
    "Edgar Barreto", "Nelson Haedo Valdez", "Roque Santa Cruz", "Lucas Barrios|DC|76|2010",
    "Óscar Cardozo|DC|76|2010"] },
  { c: 'NZL', y: 2010, f: '3-5-2', p: [
    "Mark Paston|POR|66|2010", "Ryan Nelsen|DFC|74|2010", "Winston Reid|DFC|70|2010", "Tommy Smith|DFC|65|2010",
    "Tony Lochhead|LI|62|2010", "Leo Bertos|MD|63|2010", "Ivan Vicelich|MCD|64|2010", "Tim Brown|MC|63|2010",
    "Simon Elliott|MC|64|2010", "Shane Smeltz|DC|67|2010", "Chris Killen|DC|64|2010", "Rory Fallon|DC|65|2010"] },
  { c: 'SVK', y: 2010, f: '4-2-3-1', p: [
    "Ján Mucha|POR|72|2010", "Peter Pekarík|LD|70|2010", "Martin Škrtel|DFC|82|2010", "Ján Ďurica|DFC|71|2010",
    "Radoslav Zabavník|LI|68|2010", "Zdeno Štrba|MCD|68|2010", "Kamil Kopúnek|MC|68|2010", "Juraj Kucka|MC|71|2010",
    "Vladimír Weiss|ED|71|2010", "Marek Hamšík|MCO|83|2010", "Miroslav Stoch|EI|70|2010", "Róbert Vittek|DC|74|2010",
    "Stanislav Šesták|DC|70|2010"] },
  { c: 'PRK', y: 2010, f: '5-3-2', p: [
    "Ri Myong-guk|POR|66|2010", "Cha Jong-hyok|LD|62|2010", "Ri Jun-il|DFC|61|2010", "Ri Kwang-chon|DFC|62|2010",
    "Pak Chol-jin|DFC|61|2010", "Ji Yun-nam|LI|61|2010", "An Yong-hak|MC|66|2010", "Mun In-guk|MC|62|2010",
    "Pak Nam-chol|MC|63|2010", "Kim Yong-jun|MC|61|2010", "Hong Yong-jo|DC|67|2010", "Jong Tae-se|DC|72|2010"] },
  { c: 'CIV', y: 2010, f: '4-3-3', p: [
    "Boubacar Barry|POR|74|2006", "Emmanuel Eboué", "Kolo Touré", "Souleymane Bamba|DFC|74|2010",
    "Siaka Tiéné|LI|73|2010", "Didier Zokora", "Cheick Tioté|MCD|78|2010", "Yaya Touré",
    "Romaric|MC|74|2010", "Salomon Kalou|ED|79|2010", "Didier Drogba", "Gervinho|EI|80|2010"] },
  { c: 'POR', y: 2010, f: '4-3-3', p: [
    "Eduardo|POR|76|2010", "Paulo Ferreira|LD|76|2006", "Ricardo Carvalho", "Bruno Alves|DFC|78|2010",
    "Fábio Coentrão|LI|78|2010", "Pepe", "Raul Meireles|MC|77|2010", "Tiago|MC|76|2006",
    "Deco", "Simão", "Cristiano Ronaldo", "Hugo Almeida|DC|73|2010",
    "Liédson|DC|74|2010"] },
  { c: 'SUI', y: 2010, f: '4-4-2', p: [
    "Diego Benaglio|POR|79|2010", "Stephan Lichtsteiner|LD|78|2010", "Stéphane Grichting|DFC|72|2010", "Philippe Senderos",
    "Steve von Bergen|DFC|71|2010", "Reto Ziegler|LI|71|2010", "Tranquillo Barnetta", "Gökhan Inler|MC|78|2010",
    "Benjamin Huggel|MCD|73|2010", "Gelson Fernandes|MC|72|2010", "Blaise Nkufo|DC|73|2010", "Eren Derdiyok|DC|72|2010",
    "Alexander Frei"] },
  { c: 'HON', y: 2010, f: '4-4-2', p: [
    "Noel Valladares|POR|70|2010", "Mauricio Sabillón|LD|64|2010", "Víctor Bernárdez|DFC|67|2010", "Osman Chávez|DFC|66|2010",
    "Maynor Figueroa|DFC|70|2010", "Emilio Izaguirre|LI|70|2010", "Wilson Palacios|MCD|75|2010", "Hendry Thomas|MC|68|2010",
    "Amado Guevara|MC|69|2010", "Edgar Álvarez|MD|67|2010", "Walter Martínez|EI|66|2010", "David Suazo|DC|74|2010",
    "Carlos Pavón|DC|69|2010"] },
  { c: 'CHI', y: 2010, f: '4-3-3', p: [
    "Claudio Bravo", "Mauricio Isla", "Gary Medel", "Waldo Ponce|DFC|72|2010",
    "Gonzalo Jara", "Carlos Carmona|MCD|71|2010", "Arturo Vidal", "Rodrigo Millar|MC|70|2010",
    "Jorge Valdivia", "Matías Fernández|MCO|74|2010", "Alexis Sánchez", "Humberto Suazo|DC|74|2010",
    "Jean Beausejour|EI|73|2010"] },
  { c: 'CRO', y: 2014, f: '4-2-3-1', p: [
    "Stipe Pletikosa", "Darijo Srna", "Vedran Ćorluka|DFC|79|2006", "Dejan Lovren",
    "Danijel Pranjić|LI|75|2006", "Luka Modrić", "Ivan Rakitić", "Mateo Kovačić",
    "Ivan Perišić", "Ivica Olić", "Mario Mandžukić", "Nikica Jelavić|DC|76|2014"] },
  { c: 'MEX', y: 2014, f: '5-3-2', p: [
    "Guillermo Ochoa", "Paul Aguilar", "Francisco Javier Rodríguez", "Rafael Márquez",
    "Héctor Moreno", "Miguel Layún|LI|76|2014", "Héctor Herrera", "José Juan Vázquez|MCD|74|2014",
    "Andrés Guardado", "Giovani dos Santos", "Oribe Peralta|DC|77|2014", "Javier Hernández"] },
  { c: 'CMR', y: 2014, f: '4-3-3', p: [
    "Charles Itandje|POR|70|2014", "Allan Nyom|LD|70|2014", "Nicolas N'Koulou", "Aurélien Chedjou|DFC|74|2010",
    "Benoît Assou-Ekotto", "Alex Song|MCD|77|2010", "Stéphane Mbia", "Eyong Enoh|MC|70|2010",
    "Benjamin Moukandjo|ED|72|2014", "Eric Maxim Choupo-Moting", "Samuel Eto'o", "Vincent Aboubakar|DC|74|2014"] },
  { c: 'ESP', y: 2014, f: '4-3-3', p: [
    "Iker Casillas", "César Azpilicueta|LD|80|2014", "Sergio Ramos", "Gerard Piqué",
    "Jordi Alba", "Sergio Busquets", "Xabi Alonso", "Xavi",
    "Andrés Iniesta", "David Silva|MCO|87|2010", "Pedro", "Diego Costa|DC|82|2014",
    "Koke|MC|80|2014"] },
  { c: 'AUS', y: 2014, f: '4-2-3-1', p: [
    "Mathew Ryan|POR|74|2014", "Ivan Franjic|LD|67|2014", "Matthew Spiranovic|DFC|70|2010", "Alex Wilkinson|DFC|68|2014",
    "Jason Davidson|LI|67|2014", "Mile Jedinak|MCD|74|2014", "Mark Milligan|MC|70|2010", "Mark Bresciano",
    "Mathew Leckie|ED|71|2014", "Tommy Oar|EI|69|2014", "Tim Cahill"] },
  { c: 'GRE', y: 2014, f: '4-3-3', p: [
    "Orestis Karnezis|POR|74|2014", "Vasilis Torosidis", "Sokratis Papastathopoulos|DFC|79|2010", "Kostas Manolas|DFC|77|2014",
    "José Holebas|LI|73|2014", "Kostas Katsouranis", "Giannis Maniatis|MC|72|2014", "Andreas Samaris|MC|72|2014",
    "Giorgos Karagounis", "Dimitris Salpingidis", "Georgios Samaras", "Kostas Mitroglou|DC|74|2014",
    "Theofanis Gekas"] },
  { c: 'CIV', y: 2014, f: '4-2-3-1', p: [
    "Boubacar Barry", "Serge Aurier|LD|76|2014", "Kolo Touré", "Sol Bamba|DFC|72|2014",
    "Arthur Boka", "Cheick Tioté", "Yaya Touré", "Serey Dié|MC|72|2014",
    "Gervinho", "Salomon Kalou", "Didier Drogba", "Wilfried Bony|DC|79|2014"] },
  { c: 'JPN', y: 2014, f: '4-2-3-1', p: [
    "Eiji Kawashima", "Atsuto Uchida|LD|75|2010", "Maya Yoshida", "Masato Morishige|DFC|71|2014",
    "Yūto Nagatomo", "Makoto Hasebe", "Yasuhito Endō", "Hotaru Yamaguchi|MCD|71|2014",
    "Keisuke Honda", "Shinji Kagawa|MCO|80|2014", "Shinji Okazaki", "Yoshito Ōkubo"] },
  { c: 'URU', y: 2014, f: '4-4-2', p: [
    "Fernando Muslera", "Maxi Pereira", "Diego Lugano", "Diego Godín",
    "José María Giménez", "Martín Cáceres", "Egidio Arévalo Ríos", "Álvaro Pereira",
    "Cristian Rodríguez|MI|77|2010", "Gastón Ramírez|MC|75|2014", "Luis Suárez", "Edinson Cavani",
    "Diego Forlán"] },
  { c: 'ING', y: 2014, f: '4-2-3-1', p: [
    "Joe Hart|POR|81|2014", "Glen Johnson", "Gary Cahill|DFC|80|2014", "Phil Jagielka|DFC|77|2014",
    "Leighton Baines|LI|78|2014", "Steven Gerrard", "Jordan Henderson", "Frank Lampard",
    "Raheem Sterling", "Danny Welbeck|EI|76|2014", "Wayne Rooney", "Daniel Sturridge|DC|80|2014"] },
  { c: 'ITA', y: 2014, f: '4-3-3', p: [
    "Gianluigi Buffon", "Ignazio Abate|LD|76|2014", "Andrea Barzagli|DFC|82|2006", "Giorgio Chiellini",
    "Leonardo Bonucci|DFC|81|2010", "Matteo Darmian|LI|76|2014", "Daniele De Rossi", "Andrea Pirlo",
    "Claudio Marchisio", "Marco Verratti|MC|79|2014", "Antonio Candreva|ED|77|2014", "Mario Balotelli|DC|79|2014",
    "Ciro Immobile|DC|76|2014"] },
  { c: 'SUI', y: 2014, f: '4-2-3-1', p: [
    "Diego Benaglio", "Stephan Lichtsteiner", "Johan Djourou|DFC|74|2006", "Fabian Schär|DFC|74|2014",
    "Steve von Bergen", "Ricardo Rodríguez|LI|79|2014", "Gökhan Inler", "Valon Behrami",
    "Granit Xhaka|MC|78|2014", "Xherdan Shaqiri|ED|81|2014", "Admir Mehmedi|MI|74|2014", "Josip Drmić|DC|73|2014",
    "Haris Seferović|DC|72|2014"] },
  { c: 'ECU', y: 2014, f: '4-4-2', p: [
    "Alexander Domínguez|POR|71|2014", "Juan Carlos Paredes|LD|70|2014", "Jorge Guagua|DFC|69|2014", "Frickson Erazo|DFC|69|2014",
    "Walter Ayoví|LI|72|2006", "Antonio Valencia", "Christian Noboa|MC|72|2014", "Segundo Castillo",
    "Carlos Gruezo|MCD|68|2014", "Jefferson Montero|MI|73|2014", "Enner Valencia|DC|77|2014", "Felipe Caicedo|DC|74|2014"] },
  { c: 'FRA', y: 2014, f: '4-3-3', p: [
    "Hugo Lloris", "Mathieu Debuchy|LD|77|2014", "Raphaël Varane", "Mamadou Sakho|DFC|77|2014",
    "Patrice Evra", "Yohan Cabaye|MCD|79|2014", "Paul Pogba", "Blaise Matuidi",
    "Moussa Sissoko|MC|76|2014", "Mathieu Valbuena|ED|79|2014", "Antoine Griezmann", "Karim Benzema|DC|87|2014",
    "Olivier Giroud"] },
  { c: 'HON', y: 2014, f: '4-4-2', p: [
    "Noel Valladares", "Brayan Beckeles|LD|65|2014", "Maynor Figueroa", "Víctor Bernárdez",
    "Emilio Izaguirre", "Óscar Boniek García|MD|69|2010", "Wilson Palacios", "Roger Espinoza|MC|68|2010",
    "Andy Najar|MI|66|2014", "Jerry Bengtson|DC|66|2014", "Carlo Costly|DC|67|2010"] },
  { c: 'BIH', y: 2014, f: '4-2-3-1', p: [
    "Asmir Begović|POR|79|2014", "Mensur Mujdža|LD|67|2014", "Emir Spahić|DFC|73|2014", "Ermin Bičakčić|DFC|70|2014",
    "Sead Kolašinac|LI|72|2014", "Muhamed Bešić|MCD|70|2014", "Haris Medunjanin|MC|71|2014", "Miralem Pjanić|MC|82|2014",
    "Zvjezdan Misimović|MCO|72|2014", "Senad Lulić|MI|73|2014", "Izet Hajrović|ED|68|2014", "Edin Džeko|DC|83|2014",
    "Vedad Ibišević|DC|75|2014"] },
  { c: 'IRN', y: 2014, f: '4-2-3-1', p: [
    "Alireza Haghighi|POR|67|2014", "Steven Beitashour|LD|65|2014", "Jalal Hosseini|DFC|66|2014", "Amir Hossein Sadeghi|DFC|64|2014",
    "Mehrdad Pooladi|LI|65|2014", "Andranik Teymourian", "Javad Nekounam", "Ehsan Hajsafi|MC|67|2014",
    "Ashkan Dejagah|MD|70|2014", "Masoud Shojaei|MCO|67|2006", "Alireza Jahanbakhsh|MI|68|2014", "Reza Ghoochannejhad|DC|68|2014"] },
  { c: 'NGA', y: 2014, f: '4-3-3', p: [
    "Vincent Enyeama", "Efe Ambrose|LD|69|2014", "Kenneth Omeruo|DFC|70|2014", "Joseph Yobo",
    "Godfrey Oboabona|DFC|67|2014", "Juwon Oshaniwa|LI|66|2014", "John Obi Mikel|MC|79|2010", "Ogenyi Onazi|MCD|71|2014",
    "Victor Moses|ED|76|2014", "Ahmed Musa|EI|74|2014", "Emmanuel Emenike|DC|74|2014", "Peter Odemwingie"] },
  { c: 'POR', y: 2014, f: '4-3-3', p: [
    "Rui Patrício", "João Pereira|LD|74|2014", "Pepe", "Bruno Alves",
    "Fábio Coentrão", "Miguel Veloso|MCD|74|2010", "William Carvalho", "João Moutinho",
    "Raul Meireles", "Nani|ED|80|2014", "Cristiano Ronaldo", "Hélder Postiga|DC|72|2006",
    "Hugo Almeida"] },
  { c: 'GHA', y: 2014, f: '4-2-3-1', p: [
    "Fatau Dauda|POR|68|2014", "Daniel Opare|LD|68|2014", "John Boye|DFC|69|2014", "Jonathan Mensah|DFC|70|2010",
    "Kwadwo Asamoah", "Rabiu Mohammed|MCD|68|2014", "Michael Essien", "Sulley Muntari",
    "Christian Atsu|ED|72|2014", "Kevin-Prince Boateng", "André Ayew", "Asamoah Gyan"] },
  { c: 'USA', y: 2014, f: '4-2-3-1', p: [
    "Tim Howard", "Fabian Johnson|LD|74|2014", "DeAndre Yedlin|LD|70|2014", "Matt Besler|DFC|72|2014",
    "Geoff Cameron|DFC|73|2014", "Omar Gonzalez|DFC|71|2014", "DaMarcus Beasley", "Kyle Beckerman|MCD|71|2014",
    "Jermaine Jones|MC|76|2014", "Michael Bradley", "Graham Zusi|MD|71|2014", "Clint Dempsey",
    "Jozy Altidore"] },
  { c: 'BEL', y: 2014, f: '4-3-3', p: [
    "Thibaut Courtois", "Toby Alderweireld", "Vincent Kompany", "Daniel Van Buyten",
    "Jan Vertonghen", "Axel Witsel", "Marouane Fellaini", "Kevin De Bruyne",
    "Dries Mertens", "Kevin Mirallas|ED|76|2014", "Eden Hazard", "Romelu Lukaku",
    "Divock Origi|DC|74|2014"] },
  { c: 'ALG', y: 2014, f: '4-2-3-1', p: [
    "Raïs M'Bolhi", "Aïssa Mandi|LD|68|2014", "Rafik Halliche", "Madjid Bougherra",
    "Faouzi Ghoulam|LI|73|2014", "Carl Medjani|MCD|67|2014", "Nabil Bentaleb|MC|71|2014", "Yacine Brahimi|MCO|76|2014",
    "Sofiane Feghouli|ED|75|2014", "Riyad Mahrez|ED|74|2014", "Abdelmoumene Djabou|EI|68|2014", "Islam Slimani|DC|74|2014"] },
  { c: 'RUS', y: 2014, f: '4-2-3-1', p: [
    "Igor Akinfeev", "Andrey Yeshchenko|LD|70|2014", "Vasili Berezutski|DFC|74|2014", "Sergei Ignashevich",
    "Dmitri Kombarov|LI|72|2014", "Igor Denisov|MCD|74|2014", "Viktor Fayzulin|MC|73|2014", "Oleg Shatov|MCO|73|2014",
    "Alan Dzagoev|MCO|76|2014", "Aleksandr Samedov", "Yuri Zhirkov", "Aleksandr Kokorin|DC|74|2014",
    "Aleksandr Kerzhakov|DC|74|2002"] },
  { c: 'KOR', y: 2014, f: '4-2-3-1', p: [
    "Jung Sung-ryong", "Lee Yong|LD|68|2014", "Hong Jeong-ho|DFC|69|2014", "Kim Young-gwon|DFC|70|2014",
    "Yun Suk-young|LI|67|2014", "Ki Sung-yueng", "Han Kook-young|MCD|68|2014", "Koo Ja-cheol|MCO|72|2014",
    "Lee Chung-yong", "Son Heung-min|EI|79|2014", "Park Chu-young", "Kim Shin-wook|DC|68|2014"] },
  { c: 'KSA', y: 2018, f: '4-3-3', p: [
    "Mohammed Al-Owais|POR|66|2018", "Mohammed Al-Breik|LD|64|2018", "Osama Hawsawi|DFC|67|2018", "Omar Hawsawi|DFC|64|2018",
    "Yasser Al-Shahrani|LI|66|2018", "Abdullah Otayf|MCD|66|2018", "Salman Al-Faraj|MC|68|2018", "Yahya Al-Shehri|ED|65|2018",
    "Salem Al-Dawsari|EI|69|2018", "Fahad Al-Muwallad|DC|66|2018", "Mohammad Al-Sahlawi|DC|65|2018"] },
  { c: 'EGY', y: 2018, f: '4-2-3-1', p: [
    "Mohamed El Shenawy|POR|70|2018", "Essam El Hadary|POR|68|2018", "Ahmed Fathy|LD|68|2018", "Ali Gabr|DFC|67|2018",
    "Ahmed Hegazi|DFC|72|2018", "Mohamed Abdel Shafy|LI|66|2018", "Mohamed Elneny|MCD|74|2018", "Tarek Hamed|MCD|70|2018",
    "Abdallah Said|MCO|68|2018", "Mohamed Salah|ED|88|2018", "Trézéguet|EI|70|2018", "Marwan Mohsen|DC|66|2018"] },
  { c: 'ESP', y: 2018, f: '4-2-3-1', p: [
    "David de Gea|POR|86|2014", "Dani Carvajal", "Nacho|DFC|77|2018", "Gerard Piqué",
    "Sergio Ramos", "Jordi Alba", "Sergio Busquets", "Koke",
    "Andrés Iniesta", "Isco|MCO|85|2018", "David Silva", "Marco Asensio",
    "Diego Costa"] },
  { c: 'MAR', y: 2018, f: '4-2-3-1', p: [
    "Munir Mohamedi|POR|70|2018", "Nabil Dirar|LD|71|2018", "Medhi Benatia|DFC|80|2018", "Romain Saïss",
    "Achraf Hakimi", "Karim El Ahmadi|MCD|71|2018", "Mbark Boussoufa|MC|72|2018", "Younès Belhanda|MCO|73|2018",
    "Amine Harit|MCO|74|2018", "Nordin Amrabat|ED|74|2018", "Hakim Ziyech", "Khalid Boutaïb|DC|70|2018",
    "Youssef En-Nesyri"] },
  { c: 'IRN', y: 2018, f: '4-2-3-1', p: [
    "Alireza Beiranvand|POR|72|2018", "Ramin Rezaeian|LD|67|2018", "Morteza Pouraliganji|DFC|68|2018", "Majid Hosseini|DFC|66|2018",
    "Ehsan Hajsafi", "Omid Ebrahimi|MCD|67|2018", "Saeid Ezatolahi|MCD|66|2018", "Masoud Shojaei",
    "Vahid Amiri|MI|66|2018", "Alireza Jahanbakhsh", "Karim Ansarifard|DC|67|2014", "Sardar Azmoun|DC|73|2018"] },
  { c: 'AUS', y: 2018, f: '4-2-3-1', p: [
    "Mathew Ryan", "Josh Risdon|LD|66|2018", "Trent Sainsbury|DFC|69|2018", "Mark Milligan",
    "Aziz Behich|LI|67|2018", "Mile Jedinak", "Aaron Mooy|MC|74|2018", "Tom Rogic|MCO|72|2018",
    "Mathew Leckie", "Robbie Kruse|EI|68|2018", "Andrew Nabbout|DC|65|2018", "Tim Cahill"] },
  { c: 'PER', y: 2018, f: '4-2-3-1', p: [
    "Pedro Gallese|POR|70|2018", "Luis Advíncula|LD|70|2018", "Christian Ramos|DFC|68|2018", "Alberto Rodríguez|DFC|67|2018",
    "Miguel Trauco|LI|68|2018", "Renato Tapia|MCD|70|2018", "Yoshimar Yotún|MC|70|2018", "Christian Cueva|MCO|74|2018",
    "André Carrillo|ED|73|2018", "Edison Flores|EI|72|2018", "Jefferson Farfán|DC|74|2018", "Paolo Guerrero|DC|77|2018"] },
  { c: 'DEN', y: 2018, f: '4-3-3', p: [
    "Kasper Schmeichel|POR|80|2018", "Henrik Dalsgaard|LD|70|2018", "Simon Kjær", "Andreas Christensen|DFC|77|2018",
    "Jens Stryger Larsen|LI|71|2018", "William Kvist|MCD|72|2010", "Thomas Delaney|MC|75|2018", "Lasse Schöne|MC|72|2018",
    "Christian Eriksen|MCO|85|2010", "Yussuf Poulsen|ED|74|2018", "Pione Sisto|EI|72|2018", "Nicolai Jørgensen|DC|72|2018",
    "Andreas Cornelius|DC|70|2018"] },
  { c: 'ARG', y: 2018, f: '4-3-3', p: [
    "Franco Armani|POR|75|2018", "Gabriel Mercado|LD|75|2018", "Nicolás Otamendi", "Marcos Rojo",
    "Nicolás Tagliafico", "Javier Mascherano", "Éver Banega|MC|78|2018", "Enzo Pérez",
    "Lionel Messi", "Ángel Di María", "Sergio Agüero", "Gonzalo Higuaín",
    "Cristian Pavón|ED|73|2018"] },
  { c: 'ISL', y: 2018, f: '4-4-2', p: [
    "Hannes Þór Halldórsson|POR|74|2018", "Birkir Már Sævarsson|LD|68|2018", "Ragnar Sigurðsson|DFC|71|2018", "Kári Árnason|DFC|70|2018",
    "Hörður Björgvin Magnússon|LI|68|2018", "Jóhann Berg Guðmundsson|MD|74|2018", "Aron Gunnarsson|MCD|72|2018", "Emil Hallfreðsson|MC|69|2018",
    "Gylfi Sigurðsson|MCO|79|2018", "Birkir Bjarnason|MI|71|2018", "Alfreð Finnbogason|DC|73|2018", "Jón Daði Böðvarsson|DC|67|2018"] },
  { c: 'NGA', y: 2018, f: '3-5-2', p: [
    "Francis Uzoho|POR|68|2018", "William Troost-Ekong|DFC|70|2018", "Leon Balogun|DFC|69|2018", "Kenneth Omeruo",
    "Victor Moses", "Wilfred Ndidi|MCD|77|2018", "John Obi Mikel", "Oghenekaro Etebo|MC|69|2018",
    "Bryan Idowu|MI|65|2018", "Alex Iwobi|MCO|72|2018", "Ahmed Musa", "Odion Ighalo|DC|70|2018"] },
  { c: 'SUI', y: 2018, f: '4-2-3-1', p: [
    "Yann Sommer|POR|80|2014", "Stephan Lichtsteiner", "Fabian Schär", "Manuel Akanji|DFC|77|2018",
    "Ricardo Rodríguez", "Valon Behrami", "Granit Xhaka", "Xherdan Shaqiri",
    "Blerim Džemaili|MCO|74|2014", "Steven Zuber|MI|72|2018", "Haris Seferović", "Breel Embolo|DC|72|2018"] },
  { c: 'CRC', y: 2018, f: '5-3-2', p: [
    "Keylor Navas", "Cristian Gamboa", "Giancarlo González", "Óscar Duarte",
    "Johnny Acosta|DFC|70|2014", "Bryan Oviedo|LI|70|2018", "David Guzmán|MCD|66|2018", "Celso Borges",
    "Bryan Ruiz", "Christian Bolaños", "Joel Campbell", "Marco Ureña|DC|67|2014"] },
  { c: 'SRB', y: 2018, f: '4-2-3-1', p: [
    "Vladimir Stojković", "Antonio Rukavina|LD|71|2010", "Branislav Ivanović", "Nikola Milenković|DFC|72|2018",
    "Aleksandar Kolarov", "Nemanja Matić|MCD|81|2018", "Luka Milivojević|MC|74|2018", "Sergej Milinković-Savić|MC|82|2018",
    "Dušan Tadić|MCO|80|2018", "Adem Ljajić|MCO|76|2018", "Filip Kostić|EI|74|2018", "Aleksandar Mitrović|DC|77|2018"] },
  { c: 'GER', y: 2018, f: '4-2-3-1', p: [
    "Manuel Neuer", "Joshua Kimmich", "Jérôme Boateng", "Mats Hummels",
    "Antonio Rüdiger", "Jonas Hector|LI|78|2018", "Sami Khedira", "Toni Kroos",
    "Mesut Özil", "Thomas Müller", "Marco Reus|EI|84|2018", "Julian Draxler|EI|80|2014",
    "Timo Werner|DC|81|2018"] },
  { c: 'MEX', y: 2018, f: '4-3-3', p: [
    "Guillermo Ochoa", "Carlos Salcedo|LD|74|2018", "Hugo Ayala|DFC|72|2018", "Héctor Moreno",
    "Jesús Gallardo", "Rafael Márquez", "Héctor Herrera", "Andrés Guardado",
    "Miguel Layún", "Carlos Vela", "Hirving Lozano", "Javier Hernández"] },
  { c: 'SUE', y: 2018, f: '4-4-2', p: [
    "Robin Olsen|POR|76|2018", "Mikael Lustig|LD|74|2018", "Victor Lindelöf|DFC|78|2018", "Andreas Granqvist|DFC|77|2018",
    "Ludwig Augustinsson|LI|73|2018", "Viktor Claesson|MD|72|2018", "Sebastian Larsson|MC|72|2018", "Albin Ekdal|MC|73|2018",
    "Emil Forsberg|MI|79|2018", "Marcus Berg|DC|72|2018", "Ola Toivonen|DC|73|2018"] },
  { c: 'KOR', y: 2018, f: '4-4-2', p: [
    "Jo Hyeon-woo|POR|72|2018", "Lee Yong", "Jang Hyun-soo|DFC|68|2018", "Kim Young-gwon",
    "Hong Chul|LI|65|2018", "Lee Jae-sung|MD|71|2018", "Ki Sung-yueng", "Jung Woo-young|MCD|67|2018",
    "Moon Seon-min|MI|66|2018", "Koo Ja-cheol", "Son Heung-min", "Hwang Hee-chan|DC|70|2018"] },
  { c: 'TUN', y: 2018, f: '4-3-3', p: [
    "Farouk Ben Mustapha|POR|66|2018", "Dylan Bronn|LD|66|2018", "Yassine Meriah|DFC|66|2018", "Syam Ben Youssef|DFC|65|2018",
    "Ali Maâloul|LI|70|2018", "Ellyes Skhiri|MCD|68|2018", "Ferjani Sassi|MC|68|2018", "Mohamed Amine Ben Amor|MC|65|2018",
    "Naïm Sliti|ED|69|2018", "Fakhreddine Ben Youssef|EI|67|2018", "Wahbi Khazri|DC|72|2018"] },
  { c: 'POL', y: 2018, f: '4-2-3-1', p: [
    "Wojciech Szczęsny|POR|80|2018", "Łukasz Piszczek|LD|78|2018", "Michał Pazdan|DFC|70|2018", "Kamil Glik|DFC|76|2018",
    "Maciej Rybus|LI|70|2018", "Grzegorz Krychowiak|MCD|76|2018", "Jacek Góralski|MC|69|2018", "Piotr Zieliński|MCO|79|2018",
    "Jakub Błaszczykowski|MD|75|2018", "Kamil Grosicki|MI|73|2018", "Robert Lewandowski|DC|89|2018", "Arkadiusz Milik|DC|75|2018"] },
  { c: 'SEN', y: 2018, f: '4-4-2', p: [
    "Khadim N'Diaye|POR|68|2018", "Moussa Wagué|LD|66|2018", "Kalidou Koulibaly|DFC|83|2018", "Salif Sané|DFC|70|2018",
    "Youssouf Sabaly|LI|68|2018", "Ismaïla Sarr|MD|72|2018", "Idrissa Gueye|MCD|78|2018", "Cheikhou Kouyaté|MC|74|2018",
    "Sadio Mané|MI|86|2018", "M'Baye Niang|DC|72|2018", "Keita Baldé|DC|73|2018"] },
  { c: 'COL', y: 2018, f: '4-2-3-1', p: [
    "David Ospina", "Santiago Arias|LD|75|2018", "Yerry Mina|DFC|75|2018", "Dávinson Sánchez|DFC|77|2018",
    "Johan Mojica|LI|70|2018", "Carlos Sánchez", "Wílmar Barrios|MCD|74|2018", "Jefferson Lerma|MC|72|2018",
    "Juan Cuadrado", "James Rodríguez", "Juan Fernando Quintero|MCO|77|2014", "Radamel Falcao|DC|85|2018"] },
  { c: 'JPN', y: 2018, f: '4-2-3-1', p: [
    "Eiji Kawashima", "Hiroki Sakai", "Maya Yoshida", "Gen Shōji|DFC|70|2018",
    "Yūto Nagatomo", "Makoto Hasebe", "Gaku Shibasaki|MC|72|2018", "Genki Haraguchi|MD|70|2018",
    "Keisuke Honda", "Shinji Kagawa", "Takashi Inui|EI|72|2018", "Yuya Osako|DC|71|2018"] },
  { c: 'QAT', y: 2022, f: '5-3-2', p: [
    "Saad Al-Sheeb|POR|66|2022", "Pedro Miguel|LD|65|2022", "Boualem Khoukhi|DFC|66|2022", "Bassam Al-Rawi|DFC|65|2022",
    "Abdelkarim Hassan|LI|67|2022", "Homam Ahmed|LI|63|2022", "Karim Boudiaf|MCD|65|2022", "Abdulaziz Hatem|MC|66|2022",
    "Hassan Al-Haydos|MC|67|2022", "Akram Afif|MCO|72|2022", "Almoez Ali|DC|70|2022", "Mohammed Muntari|DC|65|2022",
    "Meshaal Barsham|POR|62|2022"] },
  { c: 'ECU', y: 2022, f: '4-4-2', p: [
    "Hernán Galíndez|POR|72|2022", "Ángelo Preciado|LD|72|2022", "Félix Torres|DFC|73|2022", "Piero Hincapié|DFC|77|2022",
    "Pervis Estupiñán|LI|78|2022", "Moisés Caicedo|MCD|80|2022", "Carlos Gruezo", "Jhegson Méndez|MC|71|2022",
    "Gonzalo Plata|MD|74|2022", "Romario Ibarra|MI|71|2022", "Enner Valencia", "Michael Estrada|DC|70|2022"] },
  { c: 'SEN', y: 2022, f: '4-3-3', p: [
    "Édouard Mendy|POR|83|2022", "Youssouf Sabaly", "Kalidou Koulibaly", "Abdou Diallo|DFC|76|2022",
    "Ismail Jakobs|LI|72|2022", "Idrissa Gueye", "Nampalys Mendy|MC|74|2022", "Pape Matar Sarr|MC|75|2022",
    "Cheikhou Kouyaté", "Ismaïla Sarr", "Boulaye Dia|DC|76|2022", "Iliman Ndiaye|EI|73|2022",
    "Krépin Diatta|ED|72|2022"] },
  { c: 'IRN', y: 2022, f: '4-4-2', p: [
    "Alireza Beiranvand", "Hossein Hosseini|POR|68|2022", "Sadegh Moharrami|LD|69|2022", "Morteza Pouraliganji",
    "Majid Hosseini", "Milad Mohammadi|LI|70|2018", "Ehsan Hajsafi", "Saeid Ezatolahi",
    "Ahmad Nourollahi|MC|70|2022", "Alireza Jahanbakhsh", "Mehdi Taremi|DC|80|2018", "Sardar Azmoun",
    "Ramin Rezaeian"] },
  { c: 'WAL', y: 2022, f: '3-5-2', p: [
    "Wayne Hennessey|POR|72|2022", "Danny Ward|POR|71|2022", "Chris Mepham|DFC|72|2022", "Joe Rodon|DFC|73|2022",
    "Ben Davies|DFC|77|2022", "Connor Roberts|MD|73|2022", "Neco Williams|MI|72|2022", "Ethan Ampadu|MCD|73|2022",
    "Joe Allen|MC|74|2022", "Aaron Ramsey|MCO|77|2022", "Harry Wilson|MD|74|2022", "Gareth Bale|DC|82|2022",
    "Kieffer Moore|DC|72|2022"] },
  { c: 'KSA', y: 2022, f: '4-4-2', p: [
    "Mohammed Al-Owais", "Saud Abdulhamid|LD|69|2022", "Ali Al-Bulaihi|DFC|68|2022", "Abdulelah Al-Amri|DFC|68|2022",
    "Yasser Al-Shahrani", "Abdulellah Al-Malki|MCD|67|2022", "Mohamed Kanno|MC|69|2022", "Salman Al-Faraj",
    "Salem Al-Dawsari", "Firas Al-Buraikan|DC|68|2022", "Saleh Al-Shehri|DC|69|2022", "Hattan Bahebri|MD|67|2022",
    "Sami Al-Najei|MC|66|2022"] },
  { c: 'AUS', y: 2022, f: '4-4-2', p: [
    "Mathew Ryan", "Nathaniel Atkinson|LD|67|2022", "Miloš Degenek|LD|70|2018", "Harry Souttar|DFC|72|2022",
    "Kye Rowles|DFC|70|2022", "Aziz Behich", "Aaron Mooy", "Jackson Irvine|MCD|72|2018",
    "Riley McGree|MC|70|2022", "Mathew Leckie", "Craig Goodwin|MI|70|2022", "Mitchell Duke|DC|69|2022",
    "Ajdin Hrustić|MCO|71|2022"] },
  { c: 'TUN', y: 2022, f: '4-3-3', p: [
    "Aymen Dahmen|POR|68|2022", "Mohamed Dräger|LD|70|2018", "Montassar Talbi|DFC|71|2022", "Yassine Meriah",
    "Nader Ghandri|DFC|67|2022", "Ali Abdi|LI|69|2022", "Ellyes Skhiri", "Aïssa Laïdouni|MC|73|2022",
    "Mohamed Ali Ben Romdhane|MC|70|2022", "Youssef Msakni|ED|73|2022", "Issam Jebali|DC|68|2022", "Wahbi Khazri",
    "Naïm Sliti"] },
  { c: 'POL', y: 2022, f: '4-4-2', p: [
    "Wojciech Szczęsny", "Matty Cash|LD|78|2022", "Kamil Glik", "Jakub Kiwior|DFC|74|2022",
    "Bartosz Bereszyński|LI|74|2018", "Grzegorz Krychowiak", "Krystian Bielik|MC|74|2022", "Przemysław Frankowski|MD|75|2022",
    "Piotr Zieliński", "Sebastian Szymański|MI|76|2022", "Robert Lewandowski", "Arkadiusz Milik"] },
  { c: 'DEN', y: 2022, f: '4-3-3', p: [
    "Kasper Schmeichel", "Rasmus Kristensen|LD|76|2022", "Joachim Andersen|DFC|79|2022", "Andreas Christensen",
    "Simon Kjær", "Joakim Mæhle|LI|78|2022", "Pierre-Emile Højbjerg|MCD|83|2018", "Christian Eriksen",
    "Thomas Delaney", "Andreas Skov Olsen|ED|76|2022", "Martin Braithwaite|DC|76|2018", "Mikkel Damsgaard|EI|77|2022",
    "Kasper Dolberg|DC|75|2018"] },
  { c: 'CRC', y: 2022, f: '5-3-2', p: [
    "Keylor Navas", "Keysher Fuller|LD|69|2022", "Óscar Duarte", "Francisco Calvo|DFC|70|2018",
    "Juan Pablo Vargas|DFC|68|2022", "Kendall Waston|DFC|69|2018", "Bryan Oviedo", "Yeltsin Tejeda",
    "Celso Borges", "Jewison Bennette|EI|68|2022", "Joel Campbell", "Anthony Contreras|DC|67|2022",
    "Brandon Aguilera|MC|67|2022"] },
  { c: 'BEL', y: 2022, f: '3-5-2', p: [
    "Thibaut Courtois", "Toby Alderweireld", "Jan Vertonghen", "Arthur Theate|DFC|76|2022",
    "Timothy Castagne|MD|78|2022", "Axel Witsel", "Youri Tielemans|MC|82|2018", "Kevin De Bruyne",
    "Yannick Carrasco", "Eden Hazard", "Romelu Lukaku", "Leandro Trossard|DC|80|2022",
    "Michy Batshuayi|DC|77|2018"] },
  { c: 'CAN', y: 2022, f: '4-4-2', p: [
    "Milan Borjan|POR|74|2022", "Alistair Johnston|LD|73|2022", "Kamal Miller|DFC|71|2022", "Steven Vitória|DFC|71|2022",
    "Alphonso Davies|LI|84|2022", "Stephen Eustáquio|MC|75|2022", "Atiba Hutchinson|MCD|73|2022", "Tajon Buchanan|MD|75|2022",
    "Richie Laryea|LD|71|2022", "Junior Hoilett|MI|72|2022", "Jonathan David|DC|80|2022", "Cyle Larin|DC|74|2022",
    "Ismaël Koné|MC|70|2022"] },
  { c: 'SRB', y: 2022, f: '3-5-2', p: [
    "Vanja Milinković-Savić|POR|76|2022", "Nikola Milenković", "Strahinja Pavlović|DFC|75|2022", "Miloš Veljković|DFC|73|2018",
    "Andrija Živković|MD|76|2018", "Nemanja Gudelj|MCD|75|2022", "Saša Lukić|MC|75|2022", "Sergej Milinković-Savić",
    "Filip Kostić", "Dušan Tadić", "Aleksandar Mitrović", "Dušan Vlahović|DC|82|2022"] },
  { c: 'SUI', y: 2022, f: '4-2-3-1', p: [
    "Yann Sommer", "Silvan Widmer|LD|74|2022", "Manuel Akanji", "Nico Elvedi|DFC|77|2022",
    "Fabian Schär", "Ricardo Rodríguez", "Granit Xhaka", "Remo Freuler|MC|78|2022",
    "Denis Zakaria|MC|77|2018", "Xherdan Shaqiri", "Djibril Sow|MC|75|2022", "Ruben Vargas|MI|75|2022",
    "Breel Embolo"] },
  { c: 'CMR', y: 2022, f: '4-3-3', p: [
    "André Onana|POR|81|2022", "Devis Epassy|POR|68|2022", "Collins Fai|LD|70|2014", "Jean-Charles Castelletto|DFC|72|2022",
    "Nicolas N'Koulou", "Nouhou Tolo|LI|70|2022", "André-Frank Zambo Anguissa|MC|81|2022", "Martin Hongla|MCD|71|2022",
    "Pierre Kunde|MC|70|2022", "Karl Toko Ekambi|ED|75|2022", "Eric Maxim Choupo-Moting", "Vincent Aboubakar"] },
  { c: 'URU', y: 2022, f: '4-3-3', p: [
    "Sergio Rochet|POR|74|2022", "Fernando Muslera", "Guillermo Varela|LD|72|2018", "José María Giménez",
    "Diego Godín", "Mathías Olivera|LI|76|2022", "Federico Valverde|MC|87|2022", "Rodrigo Bentancur",
    "Matías Vecino", "Facundo Pellistri|ED|72|2022", "Darwin Núñez|DC|82|2022", "Luis Suárez",
    "Giorgian de Arrascaeta|MCO|79|2022"] },
  { c: 'KOR', y: 2022, f: '4-2-3-1', p: [
    "Kim Seung-gyu|POR|74|2014", "Kim Moon-hwan|LD|71|2022", "Kim Min-jae|DFC|84|2022", "Kim Young-gwon",
    "Kim Jin-su|LI|72|2022", "Jung Woo-young", "Hwang In-beom|MC|76|2022", "Lee Jae-sung",
    "Son Heung-min", "Hwang Hee-chan", "Cho Gue-sung|DC|72|2022", "Lee Kang-in|MCO|77|2022",
    "Na Sang-ho|MD|70|2022"] },
  { c: 'GHA', y: 2022, f: '4-2-3-1', p: [
    "Lawrence Ati-Zigi|POR|69|2022", "Tariq Lamptey|LD|74|2022", "Mohammed Salisu|DFC|75|2022", "Daniel Amartey|DFC|73|2022",
    "Alexander Djiku|DFC|72|2022", "Baba Rahman|LI|71|2022", "Thomas Partey|MCD|81|2022", "Salis Abdul Samed|MC|72|2022",
    "Mohammed Kudus|MCO|79|2022", "André Ayew", "Jordan Ayew|ED|74|2014", "Iñaki Williams|DC|76|2022",
    "Kamaldeen Sulemana|EI|72|2022"] },
  { c: 'MEX', y: 2026, f: '4-3-3', p: [
    "Raúl Rangel|POR|74|2026", "Jorge Sánchez", "César Montes", "Johan Vásquez|DFC|77|2026",
    "Jesús Gallardo", "Edson Álvarez", "Álvaro Fidalgo|MC|76|2026", "Luis Chávez|MC|76|2022",
    "Alexis Vega", "Raúl Jiménez", "Santiago Giménez|DC|79|2026", "Gilberto Mora|MCO|74|2026",
    "Guillermo Ochoa"] },
  { c: 'RSA', y: 2026, f: '4-2-3-1', p: [
    "Ronwen Williams|POR|73|2026", "Khuliso Mudau|LD|68|2026", "Nkosinathi Sibisi|DFC|67|2026", "Mbekezeli Mbokazi|DFC|67|2026",
    "Aubrey Modiba|LI|68|2026", "Teboho Mokoena", "Thalente Mbatha|MC|67|2026", "Oswin Appollis|MD|70|2026",
    "Themba Zwane|MCO|70|2026", "Relebohile Mofokeng|MI|70|2026", "Lyle Foster|DC|72|2026", "Iqraam Rayners|DC|68|2026"] },
  { c: 'KOR', y: 2026, f: '4-2-3-1', p: [
    "Kim Seung-gyu", "Seol Young-woo|LD|73|2026", "Kim Min-jae", "Lee Han-beom|DFC|72|2026",
    "Lee Tae-seok|LI|70|2026", "Hwang In-beom", "Paik Seung-ho|MC|74|2022", "Lee Kang-in",
    "Lee Jae-sung", "Hwang Hee-chan", "Son Heung-min", "Cho Gue-sung",
    "Oh Hyeon-gyu|DC|73|2026"] },
  { c: 'CZE', y: 2026, f: '4-2-3-1', p: [
    "Matěj Kovář|POR|76|2026", "Vladimír Coufal|LD|76|2026", "Robin Hranáč|DFC|75|2026", "Ladislav Krejčí|DFC|76|2026",
    "David Jurásek|LI|72|2026", "Tomáš Souček|MCD|79|2026", "Lukáš Provod|MC|75|2026", "Vladimír Darida|MC|72|2026",
    "Pavel Šulc|MCO|76|2026", "Adam Hložek|MI|75|2026", "Patrik Schick|DC|81|2026", "Tomáš Chorý|DC|73|2026"] },
  { c: 'CAN', y: 2026, f: '4-4-2', p: [
    "Dayne St. Clair|POR|74|2026", "Alistair Johnston", "Moïse Bombito|DFC|75|2026", "Derek Cornelius|DFC|72|2026",
    "Alphonso Davies", "Stephen Eustáquio", "Ismaël Koné", "Tajon Buchanan",
    "Jacob Shaffelburg|MI|72|2026", "Jonathan David", "Cyle Larin", "Tani Oluwaseyi|DC|71|2026",
    "Richie Laryea"] },
  { c: 'SUI', y: 2026, f: '4-2-3-1', p: [
    "Gregor Kobel|POR|84|2022", "Silvan Widmer", "Manuel Akanji", "Nico Elvedi",
    "Ricardo Rodríguez", "Granit Xhaka", "Remo Freuler", "Denis Zakaria",
    "Dan Ndoye|MD|78|2026", "Johan Manzambi|MCO|75|2026", "Ruben Vargas", "Breel Embolo"] },
  { c: 'QAT', y: 2026, f: '4-3-3', p: [
    "Meshaal Barsham", "Pedro Miguel", "Boualem Khoukhi", "Lucas Mendes|DFC|66|2026",
    "Homam Ahmed", "Karim Boudiaf", "Abdulaziz Hatem", "Hassan Al-Haydos",
    "Edmilson Junior|ED|70|2026", "Almoez Ali", "Akram Afif", "Mohammed Muntari"] },
  { c: 'BIH', y: 2026, f: '4-4-2', p: [
    "Nikola Vasilj|POR|72|2026", "Amar Dedić|LD|76|2026", "Nikola Katić|DFC|72|2026", "Tarik Muharemović|DFC|72|2026",
    "Sead Kolašinac", "Benjamin Tahirović|MCD|71|2026", "Armin Gigović|MC|71|2026", "Amar Memić|MD|69|2026",
    "Kerim Alajbegović|MI|72|2026", "Ermedin Demirović|DC|77|2026", "Edin Džeko", "Esmir Bajraktarević|ED|72|2026"] },
  { c: 'BRA', y: 2026, f: '4-2-3-1', p: [
    "Alisson", "Danilo", "Marquinhos", "Gabriel Magalhães|DFC|86|2026",
    "Alex Sandro|LI|76|2022", "Casemiro", "Bruno Guimarães", "Raphinha",
    "Matheus Cunha|MCO|83|2026", "Vinícius Júnior", "Neymar", "Lucas Paquetá",
    "Endrick|DC|78|2026"] },
  { c: 'MAR', y: 2026, f: '4-3-3', p: [
    "Yassine Bounou", "Achraf Hakimi", "Chadi Riad|DFC|74|2026", "Issa Diop|DFC|74|2026",
    "Noussair Mazraoui", "Sofyan Amrabat", "Azzedine Ounahi", "Neil El Aynaoui|MC|76|2026",
    "Bilal El Khannouss|MCO|75|2026", "Brahim Díaz|ED|82|2026", "Ayoub El Kaabi|DC|76|2026", "Ismael Saibari|EI|77|2026"] },
  { c: 'HAI', y: 2026, f: '4-4-2', p: [
    "Johny Placide|POR|66|2026", "Carlens Arcus|LD|68|2026", "Ricardo Adé|DFC|66|2026", "Hannes Delcroix|DFC|66|2026",
    "Martin Expérience|LI|64|2026", "Carl Sainté|MCD|63|2026", "Jean-Ricner Bellegarde|MC|72|2026", "Danley Jean Jacques|MC|65|2026",
    "Josué Casimir|MD|67|2026", "Derrick Etienne Jr.|MI|65|2026", "Wilson Isidor|DC|72|2026", "Duckens Nazon|DC|66|2026",
    "Frantzdy Pierrot|DC|66|2026"] },
  { c: 'SCO', y: 2026, f: '4-2-3-1', p: [
    "Angus Gunn|POR|74|2026", "Aaron Hickey|LD|74|2026", "Grant Hanley|DFC|71|2026", "John Souttar|DFC|71|2026",
    "Kieran Tierney|DFC|75|2026", "Andy Robertson|LI|80|2026", "Scott McTominay|MC|84|2026", "John McGinn|MC|78|2026",
    "Lewis Ferguson|MC|76|2026", "Ryan Christie|MCO|74|2026", "Ben Gannon-Doak|ED|72|2026", "Ché Adams|DC|73|2026"] },
  { c: 'USA', y: 2026, f: '4-2-3-1', p: [
    "Matt Turner", "Sergiño Dest", "Chris Richards|DFC|77|2026", "Tim Ream",
    "Antonee Robinson", "Tyler Adams", "Weston McKennie", "Christian Pulisic",
    "Malik Tillman|MCO|77|2026", "Timothy Weah", "Folarin Balogun|DC|77|2026", "Gio Reyna",
    "Matt Freese|POR|73|2026"] },
  { c: 'PAR', y: 2026, f: '4-4-2', p: [
    "Gatito Fernández|POR|72|2026", "Juan José Cáceres|LD|71|2026", "Gustavo Gómez|DFC|78|2026", "Omar Alderete|DFC|76|2026",
    "Júnior Alonso|LI|74|2026", "Andrés Cubas|MCD|74|2026", "Diego Gómez|MC|76|2026", "Miguel Almirón|MD|76|2026",
    "Ramón Sosa|MI|74|2026", "Julio Enciso|MCO|76|2026", "Antonio Sanabria|DC|74|2026", "Fabián Balbuena|DFC|73|2026"] },
  { c: 'AUS', y: 2026, f: '4-2-3-1', p: [
    "Mathew Ryan", "Miloš Degenek", "Harry Souttar", "Alessandro Circati|DFC|73|2026",
    "Jordan Bos|LI|73|2026", "Jackson Irvine", "Aiden O'Neill|MC|70|2026", "Nestory Irankunda|MD|72|2026",
    "Ajdin Hrustić", "Mathew Leckie", "Mohamed Touré|DC|70|2026", "Aziz Behich"] },
  { c: 'TUR', y: 2026, f: '4-2-3-1', p: [
    "Uğurcan Çakır|POR|78|2026", "Zeki Çelik|LD|76|2026", "Merih Demiral|DFC|78|2026", "Abdülkerim Bardakcı|DFC|75|2026",
    "Ferdi Kadıoğlu|LI|78|2026", "Hakan Çalhanoğlu|MCD|84|2026", "Orkun Kökçü|MC|78|2026", "Arda Güler|MCO|84|2026",
    "Kerem Aktürkoğlu|MI|78|2026", "Kenan Yıldız|EI|83|2026", "Barış Alper Yılmaz|DC|77|2026", "İsmail Yüksek|MCD|74|2026",
    "Mert Günok|POR|73|2026"] },
  { c: 'GER', y: 2026, f: '4-2-3-1', p: [
    "Manuel Neuer", "Joshua Kimmich", "Antonio Rüdiger", "Jonathan Tah|DFC|83|2026",
    "Nico Schlotterbeck", "David Raum", "Aleksandar Pavlović|MCD|81|2026", "Leon Goretzka|MC|81|2018",
    "Florian Wirtz|MCO|87|2026", "Jamal Musiala", "Leroy Sané", "Kai Havertz",
    "Nick Woltemade|DC|80|2026"] },
  { c: 'CUW', y: 2026, f: '4-3-3', p: [
    "Eloy Room|POR|66|2026", "Shurandy Sambo|LD|65|2026", "Armando Obispo|DFC|68|2026", "Riechedly Bazoer|DFC|66|2026",
    "Sherel Floranus|LI|63|2026", "Godfried Roemeratoe|MCD|64|2026", "Juninho Bacuna|MC|66|2026", "Leandro Bacuna|MC|66|2026",
    "Tahith Chong|MCO|67|2026", "Kenji Gorré|ED|64|2026", "Jürgen Locadia|DC|64|2026", "Sontje Hansen|EI|66|2026"] },
  { c: 'CIV', y: 2026, f: '4-3-3', p: [
    "Yahia Fofana|POR|72|2026", "Wilfried Singo|LD|76|2026", "Odilon Kossounou|DFC|76|2026", "Evan Ndicka|DFC|78|2026",
    "Ghislain Konan|LI|71|2026", "Ibrahim Sangaré|MCD|77|2026", "Franck Kessié|MC|79|2026", "Seko Fofana|MC|77|2026",
    "Amad Diallo|ED|80|2026", "Ange-Yoan Bonny|DC|77|2026", "Simon Adingra|EI|76|2026", "Ousmane Diomande|DFC|78|2026",
    "Nicolas Pépé|ED|76|2026"] },
  { c: 'ECU', y: 2026, f: '4-3-3', p: [
    "Hernán Galíndez", "Ángelo Preciado", "Willian Pacho|DFC|83|2026", "Piero Hincapié",
    "Pervis Estupiñán", "Moisés Caicedo", "Alan Franco|MC|74|2022", "Kendry Páez|MCO|75|2026",
    "Gonzalo Plata", "Enner Valencia", "John Yeboah|EI|73|2026", "Kevin Rodríguez|DC|72|2026",
    "Joel Ordóñez|DFC|76|2026"] },
  { c: 'NED', y: 2026, f: '4-3-3', p: [
    "Bart Verbruggen|POR|80|2026", "Denzel Dumfries", "Jan Paul van Hecke|DFC|80|2026", "Virgil van Dijk",
    "Micky van de Ven|DFC|83|2026", "Ryan Gravenberch|MCD|84|2026", "Frenkie de Jong", "Tijjani Reijnders|MC|84|2026",
    "Donyell Malen|ED|79|2026", "Memphis Depay", "Cody Gakpo", "Nathan Aké",
    "Teun Koopmeiners"] },
  { c: 'JPN', y: 2026, f: '3-5-2', p: [
    "Zion Suzuki|POR|76|2026", "Ko Itakura", "Takehiro Tomiyasu", "Hiroki Itō|DFC|77|2022",
    "Junya Itō", "Ao Tanaka|MC|77|2022", "Daichi Kamada", "Takefusa Kubo|MCO|81|2022",
    "Keito Nakamura|MI|76|2026", "Ritsu Dōan", "Ayase Ueda|DC|77|2022", "Daizen Maeda|DC|77|2022"] },
  { c: 'SUE', y: 2026, f: '3-5-2', p: [
    "Jacob Widell Zetterström|POR|72|2026", "Isak Hien|DFC|78|2026", "Victor Lindelöf", "Gustaf Lagerbielke|DFC|73|2026",
    "Anthony Elanga|MD|78|2026", "Lucas Bergvall|MC|77|2026", "Jesper Karlström|MCD|72|2026", "Yasin Ayari|MC|74|2026",
    "Gabriel Gudmundsson|MI|73|2026", "Benjamin Nygren|MCO|74|2026", "Alexander Isak|DC|86|2026", "Viktor Gyökeres|DC|85|2026",
    "Daniel Svensson|LI|74|2026"] },
  { c: 'TUN', y: 2026, f: '4-3-3', p: [
    "Aymen Dahmen", "Yan Valery|LD|70|2022", "Montassar Talbi", "Dylan Bronn",
    "Ali Abdi", "Ellyes Skhiri", "Rani Khedira|MC|73|2026", "Hannibal Mejbri|MC|72|2022",
    "Anis Ben Slimane|MCO|70|2022", "Elias Achouri|ED|71|2026", "Hazem Mastouri|DC|68|2026", "Sebastian Tounekti|EI|70|2026"] },
  { c: 'BEL', y: 2026, f: '4-2-3-1', p: [
    "Thibaut Courtois", "Timothy Castagne", "Zeno Debast|DFC|77|2026", "Arthur Theate",
    "Maxim De Cuyper|LI|77|2026", "Amadou Onana|MCD|80|2022", "Youri Tielemans", "Jérémy Doku|MD|84|2022",
    "Kevin De Bruyne", "Leandro Trossard", "Romelu Lukaku", "Charles De Ketelaere|DC|80|2022"] },
  { c: 'EGY', y: 2026, f: '4-3-3', p: [
    "Mohamed El Shenawy", "Mohamed Hany|LD|71|2026", "Yasser Ibrahim|DFC|71|2026", "Ramy Rabia|DFC|71|2026",
    "Ahmed Fatouh|LI|70|2026", "Hamdy Fathy|MCD|71|2026", "Emam Ashour|MC|74|2026", "Marwan Attia|MC|70|2026",
    "Mohamed Salah", "Omar Marmoush|DC|83|2026", "Trézéguet", "Zizo|ED|73|2026"] },
  { c: 'IRN', y: 2026, f: '4-2-3-1', p: [
    "Alireza Beiranvand", "Ramin Rezaeian", "Hossein Kanaanizadegan|DFC|71|2022", "Shojae Khalilzadeh|DFC|71|2022",
    "Milad Mohammadi", "Saeid Ezatolahi", "Saman Ghoddos|MCD|72|2018", "Alireza Jahanbakhsh",
    "Mohammad Mohebi|MCO|72|2026", "Mehdi Ghayedi|MI|72|2026", "Mehdi Taremi", "Ehsan Hajsafi"] },
  { c: 'NZL', y: 2026, f: '4-3-3', p: [
    "Max Crocombe|POR|67|2026", "Tim Payne|LD|65|2026", "Tyler Bindon|DFC|67|2026", "Michael Boxall|DFC|65|2026",
    "Liberato Cacace|LI|69|2026", "Joe Bell|MCD|66|2026", "Marko Stamenić|MC|67|2026", "Ryan Thomas|MC|66|2026",
    "Elijah Just|ED|66|2026", "Chris Wood|DC|77|2010", "Kosta Barbarouses|EI|64|2026", "Sarpreet Singh|MCO|65|2026"] },
  { c: 'CPV', y: 2026, f: '4-3-3', p: [
    "Vozinha|POR|67|2026", "Steven Moreira|LD|64|2026", "Logan Costa|DFC|69|2026", "Pico|DFC|64|2026",
    "Sidny Lopes Cabral|LI|65|2026", "Kevin Pina|MCD|66|2026", "Jamiro Monteiro|MC|65|2026", "Deroy Duarte|MC|64|2026",
    "Ryan Mendes|ED|66|2026", "Dailon Livramento|DC|66|2026", "Jovane Cabral|EI|67|2026", "Garry Rodrigues|ED|64|2026"] },
  { c: 'KSA', y: 2026, f: '4-3-3', p: [
    "Nawaf Al-Aqidi|POR|70|2022", "Saud Abdulhamid", "Hassan Al-Tambakti|DFC|71|2022", "Abdulelah Al-Amri",
    "Nawaf Boushal|LI|67|2026", "Mohamed Kanno", "Musab Al-Juwayr|MC|70|2026", "Nasser Al-Dawsari|MC|69|2022",
    "Ayman Yahya|ED|68|2026", "Firas Al-Buraikan", "Salem Al-Dawsari", "Saleh Al-Shehri"] },
  { c: 'URU', y: 2026, f: '4-3-3', p: [
    "Sergio Rochet", "Guillermo Varela", "Ronald Araújo|DFC|83|2022", "José María Giménez",
    "Mathías Olivera", "Manuel Ugarte|MCD|81|2026", "Federico Valverde", "Rodrigo Bentancur",
    "Giorgian de Arrascaeta", "Facundo Pellistri", "Darwin Núñez", "Maximiliano Araújo|EI|77|2026"] },
  { c: 'FRA', y: 2026, f: '4-2-3-1', p: [
    "Mike Maignan|POR|86|2026", "Jules Koundé", "Dayot Upamecano", "William Saliba|DFC|86|2022",
    "Théo Hernández", "Aurélien Tchouaméni", "Adrien Rabiot", "Ousmane Dembélé",
    "Michael Olise|MCO|87|2026", "Désiré Doué|MI|84|2026", "Kylian Mbappé", "Ibrahima Konaté|DFC|84|2022",
    "Marcus Thuram|DC|82|2022"] },
  { c: 'SEN', y: 2026, f: '4-3-3', p: [
    "Édouard Mendy", "Krépin Diatta", "Kalidou Koulibaly", "Moussa Niakhaté|DFC|76|2026",
    "Ismail Jakobs", "Idrissa Gueye", "Pape Matar Sarr", "Lamine Camara|MC|77|2026",
    "Ismaïla Sarr", "Nicolas Jackson|DC|79|2022", "Sadio Mané", "Iliman Ndiaye"] },
  { c: 'IRQ', y: 2026, f: '4-2-3-1', p: [
    "Jalal Hassan|POR|66|2026", "Hussein Ali|LD|65|2026", "Rebin Sulaka|DFC|66|2026", "Zaid Tahseen|DFC|65|2026",
    "Merchas Doski|LI|65|2026", "Amir Al-Ammari|MCD|67|2026", "Zidane Iqbal|MC|67|2026", "Ibrahim Bayesh|MD|65|2026",
    "Youssef Amyn|MCO|66|2026", "Ali Jasim|MI|65|2026", "Aymen Hussein|DC|69|2026", "Ali Al-Hamadi|DC|66|2026"] },
  { c: 'ALG', y: 2026, f: '4-3-3', p: [
    "Luca Zidane|POR|68|2026", "Rafik Belghali|LD|72|2026", "Aïssa Mandi", "Mohamed Amine Tougai|DFC|70|2026",
    "Rayan Aït-Nouri|LI|80|2026", "Ramiz Zerrouki|MCD|72|2026", "Nabil Bentaleb", "Houssem Aouar|MC|74|2026",
    "Riyad Mahrez", "Amine Gouiri|DC|77|2026", "Mohamed Amoura|EI|78|2026", "Ibrahim Maza|MCO|75|2026"] },
  { c: 'ARG', y: 2026, f: '4-3-3', p: [
    "Emiliano Martínez", "Nahuel Molina", "Cristian Romero", "Lisandro Martínez|DFC|83|2022",
    "Nicolás Tagliafico", "Enzo Fernández", "Rodrigo De Paul", "Alexis Mac Allister",
    "Lionel Messi", "Julián Álvarez", "Lautaro Martínez", "Nicolás Otamendi",
    "Nico Paz|MCO|80|2026"] },
  { c: 'AUT', y: 2026, f: '4-2-3-1', p: [
    "Alexander Schlager|POR|74|2026", "Stefan Posch|LD|75|2026", "Kevin Danso|DFC|78|2026", "David Alaba|DFC|82|2026",
    "Phillipp Mwene|LI|73|2026", "Konrad Laimer|MCD|81|2026", "Nicolas Seiwald|MCD|76|2026", "Romano Schmid|MD|76|2026",
    "Marcel Sabitzer|MCO|80|2026", "Patrick Wimmer|MI|74|2026", "Marko Arnautović|DC|77|2026", "Xaver Schlager|MC|79|2026",
    "Michael Gregoritsch|DC|75|2026"] },
  { c: 'JOR', y: 2026, f: '3-5-2', p: [
    "Yazeed Abulaila|POR|66|2026", "Abdallah Nasib|DFC|64|2026", "Yazan Al-Arab|DFC|66|2026", "Saed Al-Rosan|DFC|63|2026",
    "Ihsan Haddad|MD|64|2026", "Noor Al-Rawabdeh|MCD|64|2026", "Nizar Al-Rashdan|MC|64|2026", "Ibrahim Sadeh|MCO|63|2026",
    "Mohannad Abu Taha|MI|63|2026", "Musa Al-Taamari|ED|72|2026", "Ali Olwan|DC|67|2026", "Mahmoud Al-Mardi|DC|64|2026"] },
  { c: 'COL', y: 2026, f: '4-2-3-1', p: [
    "Camilo Vargas|POR|76|2014", "Daniel Muñoz|LD|79|2026", "Dávinson Sánchez", "Jhon Lucumí|DFC|78|2026",
    "Johan Mojica", "Jefferson Lerma", "Richard Ríos|MC|79|2026", "Jhon Arias|MD|77|2026",
    "James Rodríguez", "Luis Díaz|MI|86|2026", "Jhon Córdoba|DC|76|2026", "Kevin Castaño|MCD|73|2026"] },
  { c: 'COD', y: 2026, f: '4-3-3', p: [
    "Lionel Mpasi|POR|68|2026", "Aaron Wan-Bissaka|LD|76|2026", "Chancel Mbemba|DFC|74|2026", "Axel Tuanzebe|DFC|70|2026",
    "Arthur Masuaku|LI|70|2026", "Charles Pickel|MCD|69|2026", "Noah Sadiki|MC|70|2026", "Samuel Moutoussamy|MC|67|2026",
    "Théo Bongonda|ED|70|2026", "Yoane Wissa|DC|79|2026", "Nathanaël Mbuku|EI|68|2026", "Cédric Bakambu|DC|72|2026"] },
  { c: 'POR', y: 2026, f: '4-3-3', p: [
    "Diogo Costa", "João Cancelo", "Rúben Dias", "Gonçalo Inácio|DFC|81|2026",
    "Nuno Mendes|LI|86|2022", "Vitinha|MC|87|2022", "João Neves|MC|84|2026", "Bruno Fernandes",
    "Bernardo Silva", "Cristiano Ronaldo", "Rafael Leão", "Pedro Neto|ED|81|2026"] },
  { c: 'UZB', y: 2026, f: '4-2-3-1', p: [
    "Utkir Yusupov|POR|66|2026", "Khojiakbar Alijonov|LD|65|2026", "Abdukodir Khusanov|DFC|75|2026", "Rustam Ashurmatov|DFC|66|2026",
    "Sherzod Nasrullaev|LI|64|2026", "Otabek Shukurov|MCD|66|2026", "Odiljon Hamrobekov|MCD|65|2026", "Oston Urunov|MD|65|2026",
    "Abbosbek Fayzullaev|MCO|70|2026", "Dostonbek Khamdamov|MI|64|2026", "Eldor Shomurodov|DC|72|2026", "Igor Sergeev|DC|65|2026"] },
  { c: 'CRO', y: 2026, f: '4-3-3', p: [
    "Dominik Livaković", "Josip Stanišić|LD|79|2022", "Josip Šutalo|DFC|77|2022", "Marin Pongračić|DFC|76|2026",
    "Joško Gvardiol", "Luka Modrić", "Mateo Kovačić", "Petar Sučić|MC|77|2026",
    "Andrej Kramarić", "Ante Budimir|DC|77|2022", "Ivan Perišić", "Martin Baturina|MCO|77|2026",
    "Mario Pašalić"] },
  { c: 'GHA', y: 2026, f: '4-2-3-1', p: [
    "Lawrence Ati-Zigi", "Alidu Seidu|LD|72|2022", "Jonas Adjetey|DFC|70|2026", "Abdul Mumin|DFC|70|2026",
    "Gideon Mensah|LI|70|2022", "Thomas Partey", "Kwasi Sibo|MC|69|2026", "Abdul Fatawu|MD|75|2026",
    "Antoine Semenyo|MCO|82|2026", "Kamaldeen Sulemana", "Iñaki Williams", "Jordan Ayew"] },
  { c: 'PAN', y: 2026, f: '3-5-2', p: [
    "Orlando Mosquera|POR|68|2026", "José Córdoba|DFC|70|2026", "Fidel Escobar", "Andrés Andrade|DFC|68|2026",
    "Michael Murillo", "Adalberto Carrasquilla|MC|72|2026", "Aníbal Godoy", "Cristian Martínez|MCD|68|2026",
    "Eric Davis", "Ismael Díaz|DC|70|2018", "José Fajardo|DC|69|2026", "Édgar Bárcenas"] },
];
