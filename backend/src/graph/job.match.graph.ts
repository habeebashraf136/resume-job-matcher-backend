import { StateGraph } from '@langchain/langgraph';
import { GraphState } from './state.ts';
import { parseResume } from '../nodes/parse.resume.node.ts';
import { extractProfile } from '../nodes/extract.profile.node.ts';
import { searchJobs } from '../nodes/search.jobs.node.ts';
import { embedScoreNode } from '../nodes/embed.score.node.ts';
import { rankMatchesNode } from '../nodes/rank.matches.node.ts';
import { saveResultsNode } from '../nodes/save.results.node.ts';

const workflow = new StateGraph(GraphState)
    .addNode('parseResume', parseResume)
    .addNode('extractProfile', extractProfile)
    .addNode('searchJobs', searchJobs)
    .addNode('embedAndScore', embedScoreNode)
    .addNode('rankMatches', rankMatchesNode)
    .addNode('saveResults', saveResultsNode)
    .addEdge('__start__', 'parseResume')
    .addEdge('parseResume', 'extractProfile')
    .addEdge('extractProfile', 'searchJobs')
    .addEdge('searchJobs', 'embedAndScore')
    .addEdge('embedAndScore', 'rankMatches')
    .addEdge('rankMatches', 'saveResults')
    .addEdge('saveResults', '__end__');

export const jobMatchGraph = workflow.compile();