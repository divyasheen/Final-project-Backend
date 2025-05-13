// for working with external files - read, write
import fs from "fs/promises";

// let's connect ... it's like a bookclub. This function and the db will just meet for reading! =D
import {connect2DB, getDB} from "./db.js";

const importDataJson = async () => {

  await connect2DB();

  const db = getDB();
  
  //read lesson.json as text
  const file = await fs.readFile("../data/lessons.json", "utf-8");
  
  //parse data into array
  const lessons = JSON.parse(file);
  
  // go trough the array and waiting for execute each key from the json-file to be insert inside our db
  for (const lesson of lessons) {
    for (const lesson of lessons) {
      await db.execute('INSERT INTO lessons (id, module_id, title, content, position) VALUES (?, ?, ?, ?, ?)', [lesson.id, lesson.module_id, lesson.title, lesson.content, lesson.position]);
    }
  }
  
  console.log('Import abgeschlossen!');
  await db.end()
}

importDataJson()

