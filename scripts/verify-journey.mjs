import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
const dir='artifacts/journey-verification';await mkdir(dir,{recursive:true});const results=[];
for(const task of ['content:validate','content:coverage','content:sources','typecheck','lint','test','build','desktop:test','assets:validate','desktop:build','desktop:verify']){
 const started=Date.now();let log='';const exitCode=await new Promise(resolve=>{const child=spawn('npm',['run',task],{env:{...process.env,...(task==='build'?{GSV_VERIFY_BUILD:'1'}:{})}});child.stdout.on('data',b=>log+=b);child.stderr.on('data',b=>log+=b);child.on('close',resolve)});
 await writeFile(`${dir}/${task.replaceAll(':','-')}.log`,log);results.push({command:`npm run ${task}`,exitCode,elapsedMs:Date.now()-started,isolatedBuildDirectory:task==='build'});console.log(task,exitCode===0?'PASS':'FAIL');if(exitCode!==0)console.log(log.slice(-3500));await writeFile(`${dir}/commands.json`,JSON.stringify({verifiedAt:new Date().toISOString(),results},null,2));if(exitCode!==0)process.exit(1);
}
