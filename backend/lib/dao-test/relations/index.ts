import {inspections} from "./expections";
import {bindInjection, inject} from "../../injector";
import {DBConfig} from "../../DBConfig";
import {config} from "../test-config";
import {Doc} from "../models/Doc";
import {Chapter} from "../models/Chapter";
import {Author} from "../models/Author";
import {Paragraph} from "../models/Paragraph";
import {ChapterInfo} from "../models/ChapterInfo";
import {ChapterStatistic} from "../models/ChapterStatistic";
require('source-map-support').install();

Error.stackTraceLimit = 30;
bindInjection(DBConfig, config.db);

const testGroups = [
    {
        model: Doc,
        tests: [
            {
                relation: Doc.rel.authors,
                inspect: inspections.doc.authors
            },
            {
                relation: Doc.rel.chapters,
                inspect: inspections.doc.chapters
            },
            {
                relation: Doc.rel.paragraphs,
                inspect: inspections.doc.paragraphs
            }
        ],
    },
    {
        model: Author,
        tests: [
            {
                relation: Author.rel.chapters,
                inspect: inspections.author.chapters
            },
            {
                relation: Author.rel.paragraphs,
                inspect: inspections.author.paragraphs
            }
        ],
    },
    {
        model: Chapter,
        tests: [
            {
                relation: Chapter.rel.author,
                inspect: inspections.chapter.author
            },
            {
                relation: Chapter.rel.doc,
                inspect: inspections.chapter.doc
            },
            {
                relation: Chapter.rel.paragraphs,
                inspect: inspections.chapter.paragraphs
            },
            {
                relation: Chapter.rel.statistic,
                inspect: inspections.chapter.statistic
            },
        ],
    },
    {
        model: ChapterInfo,
        tests: [
            {
                relation: ChapterInfo.rel.chapter,
                inspect: inspections.chapterInfo.chapter
            },
            {
                relation: ChapterInfo.rel.statistic,
                inspect: inspections.chapterInfo.statistic
            }
        ],
    },
    {
        model: ChapterStatistic,
        tests: [
            {
                relation: ChapterStatistic.rel.chapterInfo,
                inspect: inspections.chapterStatistic.chapterInfo
            }
        ],
    },
    {
        model: Paragraph,
        tests: [
            {
                relation: Paragraph.rel.chapter,
                inspect: inspections.paragraph.chapter
            }
        ],
    }
];

async function runTests() {
    for (let i = 0; i < testGroups.length; i++) {
        const testGroup = testGroups[i];
        const model = inject(testGroup.model);
        for (let j = 0; j < testGroup.tests.length; j++) {
            const test = testGroup.tests[j];
            const result = await model.findAll({include: [{relation: test.relation}]});
            if (JSON.stringify(result) !== JSON.stringify(test.inspect)) {
                console.error(`Test with model: ${model.constructor.name} and relation: ${test.relation.property} is not passed`);
                // console.log(test.relation.property + ': ' + JSON.stringify(result, null, 2) + ', ');
            }
        }
    }
    return;
}
runTests().catch(err => console.error(err instanceof Error ? err.stack : err));
