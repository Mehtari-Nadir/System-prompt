import dotenv from 'dotenv';
import Anthropic from "@anthropic-ai/sdk";
import * as readline from 'readline/promises';
import { readFile } from 'fs/promises';

dotenv.config();

const apiKey: string | undefined = process.env.API_KEY;

const anthropic = new Anthropic({
    apiKey: apiKey, // defaults to process.env["ANTHROPIC_API_KEY"]
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const readFileContent = async (filePath: string): Promise<string> => {
    try {
        const data = await readFile(filePath, "utf-8");
        return data;
    } catch (err) {
        throw err;
    }
}

const chatWithClaude = async () => {

    try {
        // NOTE: the second parameter (the timeout) is optional.
        const message = await rl.question('enter instruction or prompt to claude \n');
        let system_prompt = "";

        await readFileContent("./system-prompt.txt").then((content) => {
            system_prompt = content;
        }).catch(err => console.log(err));


        const response = await anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 1000
            ,
            temperature: 0,
            system: system_prompt,
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": message
                        }
                    ]
                }
            ]
        });

        // console.log(response.content[0].text); replace(/\n/g, '');
        let text = response.content[0].text.replace(/\n/g, '');

        let tasksStart = text.indexOf('tasks: [') + 7;
        let tasksEnd = text.indexOf('],', tasksStart) + 1;
        let tasksArray = text.substring(tasksStart, tasksEnd);

        // Extract columns array
        let columnsStart = text.indexOf('columns: [') + 9;
        let columnsEnd = text.indexOf(']', columnsStart) + 1;
        let columnsArray = text.substring(columnsStart, columnsEnd);

        console.log('const tasks = ', tasksArray);
        console.log("\n");
        console.log('const columns = ', columnsArray);

    } catch (err) {
        console.log(err);
    } finally {
        rl.close();
    }
}

chatWithClaude();