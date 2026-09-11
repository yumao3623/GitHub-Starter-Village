import { describe,it,expect } from "vitest";
import { applyRegion,freshRegions,regionDone,validRegions } from "@/core/game/regions";
import { regionLessons,type RegionId } from "@/content/minigames/region-lessons";
describe("region-specific operations",()=>{
  it.each(["guide","safety","governance"] as const)("%s supports wrong, repair, repeat and reset",id=>{
    let state=freshRegions(); const lesson=regionLessons[id];
    expect(applyRegion(state,{region:id,op:"place",key:lesson.cards[0],value:"wrong"}).kind).toBe("error");
    for(const [key,value] of Object.entries(lesson.pairs)) state=applyRegion(state,{region:id,op:"place",key,value}).state;
    const [key,value]=Object.entries(lesson.pairs)[0]; expect(applyRegion(state,{region:id,op:"place",key,value}).kind).toBe("info");
    if(id==="safety") { expect(applyRegion(state,{region:id,op:"domain",key:"",value:"https://github.com.example.org/login"}).kind).toBe("error"); state=applyRegion(state,{region:id,op:"domain",key:"",value:"https://github.com/login"}).state; }
    if(id==="governance") { expect(applyRegion(state,{region:id,op:"report",key:"",value:"public"}).kind).toBe("error"); state=applyRegion(state,{region:id,op:"report",key:"",value:"security"}).state; }
    expect(regionDone(state,id)).toBe(true); expect(validRegions(state)).toBe(true);
    expect(regionDone(applyRegion(state,{region:id,op:"reset",key:"",value:""}).state,id)).toBe(false);
  });
  it("subscription changes change mailbox eligibility; delivered cannot be forged",()=>{
    let state=freshRegions(); const region:RegionId="follow";
    expect(applyRegion(state,{region,op:"deliver",key:"",value:""}).kind).toBe("error");
    for(const [key,value] of [["star","true"],["follow","true"],["watch","releases"]]) state=applyRegion(state,{region,op:"subscribe",key,value}).state;
    state=applyRegion(state,{region,op:"deliver",key:"",value:""}).state; expect(regionDone(state,region)).toBe(true);
    expect(validRegions({...freshRegions(),delivered:true})).toBe(false);
    expect(validRegions({...state,placements:{"guide:README":"bad"}})).toBe(false);
  });
});
