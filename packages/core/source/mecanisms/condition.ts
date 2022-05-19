import { EvaluationFunction } from '..'
import { ASTNode } from '../AST/types'
import { evaluationError } from '../error'
import { bonus, mergeAllMissing, mergeMissing } from '../evaluation'
import { registerEvaluationFunction } from '../evaluationFunctions'
import parse from '../parse'

export type ConditionNode = {
	explanation: {
		si: ASTNode
		alors: ASTNode
		sinon: ASTNode
	}
	nodeKind: 'condition'
}

const evaluate: EvaluationFunction<'condition'> = function (node) {
	let evaluation
	const condition = this.evaluate(node.explanation.si)
	let alors = node.explanation.alors
	let sinon = node.explanation.sinon
	if ('unit' in condition) {
		evaluationError(
			this.options.logger,
			this.cache._meta.evaluationRuleStack[0],
			'La condition doit être de type booléen'
		)
	}
	if (condition.nodeValue === true) {
		alors = this.evaluate(node.explanation.alors)
		;(alors as any).isActive = true
		evaluation = alors
	} else if (condition.nodeValue === false) {
		sinon = this.evaluate(node.explanation.sinon)
		evaluation = sinon
	} else if (condition.nodeValue === null) {
		evaluation = condition
	} else if (condition.nodeValue === undefined) {
		sinon = this.evaluate(node.explanation.sinon)
		alors = this.evaluate(node.explanation.sinon)
		evaluation = {
			...condition,
			missingVariables: mergeAllMissing([sinon, alors]),
		}
	} else {
		evaluationError(
			this.options.logger,
			this.cache._meta.evaluationRuleStack[0],
			'La condition doit être de type booléen'
		)
	}
	return {
		...evaluation,
		missingVariables: mergeMissing(
			bonus(condition.missingVariables),
			evaluation.missingVariables
		),
		...node,
		explanation: { si: condition, alors, sinon },
	}
}
export default function parseCondition(v, context) {
	const explanation = {
		si: parse(v.si, context),
		alors: parse(v.alors, context),
		sinon: parse(v.sinon, context),
	}
	return {
		explanation,
		nodeKind: 'condition',
	} as ConditionNode
}

parseCondition.nom = 'condition'

registerEvaluationFunction('condition', evaluate)