import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Common German female first names
const femaleNames = new Set([
  'aaliya','abbi','abbie','abby','abigail','ada','adaeze','adela','adelheid','adeline','adina','aditi','adriana','agatha','agnes','aigerim','aiko','aira','aisha','aisling','aissatou','aitu','alessandra','alessia','alexa','alexandra','alexia','alexia','alica','alice','alicia','alida','alima','alina','alisa','alisha','alissa','aliya','aliyah','alla','allegra','almut','alora','altea','alva','alvina','alyssa','amalia','amanda','amara','amelia','amie','amina','amira','amy','ana','anastasia','andrea','andrina','angela','angelika','angelina','anila','anina','anisa','anita','anja','anke','anna','annabelle','anne','annelies','annemarie','annette','anouk','anouschka','antje','antonia','anuschka','arabella','ariane','arifa','arjola','armina','arya','asia','astrid','athena','aurelia','aurora','ava','ayasha','aylin','ayse',
  'babette','barbara','beatrice','beatrix','belinda','bella','bettina','bianca','birgit','brigitte','britta',
  'camila','camilla','carina','carla','carlotta','carmen','carola','caroline','catharina','celine','charlotte','chiara','chloé','chloe','christa','christiane','christina','christine','claudia','constanze','cornelia',
  'dagmar','dana','daniela','daphne','debora','deborah','denise','diana','dina','dominique','dorothea','dorte',
  'elena','eleonora','elisa','elisabetta','elise','eliza','ella','ellen','elsa','elspeth','elya','emilia','emily','emma','emmeline','erika','erna','eva','eveline','evelyn',
  'fabia','fabienne','fatima','felicitas','felicity','female','fiona','florentina','francesca','franziska','frieda','fritzi',
  'gabriela','gabriele','gerda','gesa','giada','gina','giorgia','giulia','greta',
  'hana','hanna','hannah','hanne','hannelore','heidi','helene','helga','hella','henriette','hildegard','hilke',
  'ida','ilka','ilona','ilse','inga','ingrid','inna','irene','irina','iris','isabela','isabella','isabelle','isadora',
  'jacqueline','jana','jane','janina','jasmin','jasmina','jennifer','jessica','johanna','jolante','jolanda','josephine','josie','joyce','julia','juliane','juliette','julija','jutta',
  'kamila','karin','karina','karla','katharina','kathrin','katja','katrin','katrine','katya','kerstin','kirsten','klara','kora','kristin','kristina',
  'lara','larissa','laura','laureen','laurie','layla','lea','leana','leila','lena','leonie','leonora','leontine','lia','liana','lili','lilian','lina','linda','lisa','lisa-marie','lisbeth','lore','lotta','lotte','louisa','louise','luca','lucia','luisa','luise','luna',
  'madeleine','madita','magdalena','maike','maja','mandy','marah','mareen','maria','marie','marina','mariona','maristela','marjorie','marlene','marta','martha','martina','maryla','maya','melanie','melissa','merete','mia','michaela','michelle','mikaela','mira','miriam','mirjam','miriam','monika','monika',
  'nadia','nadine','nadja','nathalie','natalia','natalie','nicole','nina','nora','noura',
  'odette','olga','olivia',
  'pamela','patrizia','paula','pauline','petra','philippa','pia',
  'raphaela','rebecca','regine','reinhild','renate','renée','ricarda','rina','rita','rosa','rosalie','rosalind','rosi','roswitha',
  'sabine','sabrina','sally','sandra','sarah','selina','selma','simone','sina','sinja','siobhan','sofie','sofia','sonja','sophie','stefanie','stella','stephanie','svetlana',
  'tamara','tanja','teresa','thea','theresa','tina','tine',
  'ulrike','ursula','ute',
  'valentina','valeria','valerie','vanessa','vera','veronika','verena','viktoria','viola','vivian','viviane','vivi',
  'walburga','waltraud','wenke','wiebke',
  'xenia',
  'yvonne','yara','yasmin','yasemin',
  'zoe','zora',
]);

// Common German male first names
const maleNames = new Set([
  'aaron','adam','adil','adrian','ahmed','alan','albert','alexander','alexei','alfred','ali','alois','andras','andre','andreas','andrei','andrej','angelo','ansgar','anthony','anton','antonio','arian','armin','arno','arndt','arnold','aron','artem','arvid','august','axel',
  'baris','bastian','benedikt','benjamin','bernd','bernhard','boris','burkhard',
  'carsten','christian','christoph','christos','claas','claus','clemens',
  'daniel','darian','darius','david','dennis','diego','dietmar','dietrich','dirk','dominic','dominik',
  'edgar','edmond','eduado','edward','egon','elias','elmar','emilian','emilio','enrico','eric','erik','ernst','ethan','eugen',
  'fabian','fabio','felix','ferdinand','filip','finn','florian','frank','franz','frederik','fridolin','friedrich','fritz',
  'gabriel','georg','gerhard','giovanni','gregor','gunnar','guenther','guido','guenther','gustavo',
  'hans','hannes','hartmut','heinz','hendrik','henning','henry','herbert','hans-peter','heiko','holger','horst','hubertus','hugo',
  'ibrahim','igor','ilias',
  'jakob','jan','jason','jens','jerome','joachim','jochen','joel','johannes','jonas','jonathan','joerg','juergen','julian','julius',
  'kai','karl','karsten','kemal','kevin','kilian','klaas','klaske','klemens','konrad','konstantin','kurt',
  'lars','laurin','lazar','leander','leon','leonard','leopold','luca','lucas','luigi','luis','lukas',
  'magnus','manfred','marc','marco','mario','mark','markus','martin','matthias','max','maximilian','mehmet','meinhard','michael','miguel','mikael','mike','milan','moritz',
  'nicolai','nicolas','nikolai','nikolaus','nils',
  'oliver','omar','oskar','otto',
  'patrick','paul','peter','philipp','pierre',
  'rafael','rainer','ralph','rene','richard','robert','robin','rolf','roman',
  'samuel','sandro','sebastian','sergej','simon','stefan','steffen','stephan',
  'theodor','thomas','tim','timo','tobias','tom','torsten',
  'ulrich','urs','uwe',
  'valentin','victor','vincent','volker',
  'walter','willi','william','winfried','wolf','wolfgang',
  'xavier',
  'yannik','yannick','yusuf',
]);

function guessGenderFromFirstName(fullName: string): 'female' | 'male' | null {
  // Extract first name (first word)
  const firstName = fullName.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  // Normalize umlauts
  const normalized = firstName
    .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/[^a-z-]/g, '');

  if (femaleNames.has(normalized)) return 'female';
  if (maleNames.has(normalized)) return 'male';

  // Try stripping common suffixes for fuzzy match
  const withoutA = normalized.endsWith('a') ? normalized.slice(0, -1) : null;
  if (withoutA && femaleNames.has(withoutA + 'a')) return 'female';

  return null;
}

async function main() {
  const therapists = await prisma.therapist.findMany({
    where: { gender: null },
    select: { id: true, fullName: true },
  });

  console.log(`Found ${therapists.length} therapists without gender.`);

  let female = 0, male = 0, unknown = 0;

  for (const t of therapists) {
    const gender = guessGenderFromFirstName(t.fullName);
    if (gender) {
      await prisma.therapist.update({ where: { id: t.id }, data: { gender } });
      if (gender === 'female') female++;
      else male++;
    } else {
      unknown++;
      console.log(`  Unknown: "${t.fullName}"`);
    }
  }

  console.log(`\nDone. female=${female}, male=${male}, unknown=${unknown}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
