import { capitalise0, formatValue } from 'publicodes'
import {
	EvaluatedNode,
	Evaluation,
	Types,
	Unit,
} from 'publicodes/source/AST/types'
import React, { useContext } from 'react'
import styled, { css } from 'styled-components'
import { RenderersContext } from '../contexts'
import Explanation from '../Explanation'
import mecanismColors from './colors'

export function ConstantNode({ nodeValue, type, fullPrecision, unit }) {
	if (nodeValue === undefined) {
		return null
	}
	if (nodeValue === null) {
		return <span className="value">{formatValue({ nodeValue })}</span>
	} else if (type === 'objet') {
		return (
			<code>
				<pre>{JSON.stringify(nodeValue, undefined, 2)}</pre>
			</code>
		)
	} else if (fullPrecision) {
		return (
			<span className={type}>
				{formatValue(
					{ nodeValue, unit },
					{
						precision: 5,
					}
				)}
			</span>
		)
	} else {
		return <span className="value">{formatValue({ nodeValue, unit })}</span>
	}
}

type NodeValuePointerProps = {
	data: Evaluation<Types>
	unit: Unit | undefined
}

export const NodeValuePointer = ({ data, unit }: NodeValuePointerProps) => {
	return (
		<StyledNodeValuePointer>
			{formatValue({ nodeValue: data, unit })}
		</StyledNodeValuePointer>
	)
}

const StyledNodeValuePointer = styled.span`
	background: white;
	border-bottom: 0 !important;
	font-size: 0.875rem;
	line-height: 1.25rem;
	margin: 0 0.2rem;
	flex-shrink: 0;
	padding: 0.1rem 0.2rem;
	text-decoration: none !important;
	box-shadow: 0px 1px 2px 1px #d9d9d9, 0 0 0 1px #d9d9d9;
	border: 1px solid #f8f9fa;
	border-radius: 0.2rem;
`

// Un élément du graphe de calcul qui a une valeur interprétée (à afficher)
type NodeProps = {
	name: string
	value: Evaluation<Types>
	unit?: Unit
	children: React.ReactNode
	displayName?: boolean
}

export function Mecanism({
	name,
	value,
	children,
	unit,
	displayName = true,
}: NodeProps) {
	return (
		<StyledMecanism name={name}>
			{displayName && <MecanismName name={name}>{name}</MecanismName>}
			<div>
				{children}

				{value !== undefined && (
					<StyledMecanismValue>
						<small> =&nbsp;</small>
						<NodeValuePointer data={value} unit={unit} />
					</StyledMecanismValue>
				)}
			</div>
		</StyledMecanism>
	)
}
const StyledMecanismValue = styled.div`
	text-align: right;
	margin-top: 0.25rem;
	font-weight: bold;
`

export const InfixMecanism = ({
	value,
	prefixed,
	children,
	dimValue,
}: {
	value: EvaluatedNode
	children: React.ReactNode
	prefixed?: boolean
	dimValue?: boolean
}) => {
	return (
		<div>
			{prefixed && children}
			<div
				className="value"
				style={{
					position: 'relative',
				}}
			>
				{dimValue && <DimOverlay />}
				<Explanation node={value} />
			</div>
			{!prefixed && children}
		</div>
	)
}
const DimOverlay = styled.div`
	position: absolute;
	top: 0;
	bottom: 0;
	right: 0;
	background-color: white;
	left: 0;
	opacity: 0.5;
	pointer-events: none;
	z-index: 1;
`

export const InlineMecanismName = ({ name }: { name: string }) => {
	return (
		<MecanismName inline name={name}>
			{name}
		</MecanismName>
	)
}

const MecanismName = ({
	name,
	inline = false,
	children,
}: {
	name: string
	inline?: boolean
	children: React.ReactNode
}) => {
	return (
		<>
			<StyledMecanismName
				name={name}
				inline={inline}
				target="_blank"
				href={`https://publi.codes/docs/mécanismes#${name}`}
			>
				{children}
			</StyledMecanismName>
		</>
	)
}

type RuleExplanationProps = {
	exemples: { base: string }
	description: string
	name: string
}

export default function RuleExplanation({
	name,
	description,
	exemples,
}: RuleExplanationProps) {
	const { Text } = useContext(RenderersContext)
	return (
		<>
			{!!name && (
				<h2 id={name}>
					<pre>{name}</pre>
				</h2>
			)}
			<Text>{description}</Text>
			{exemples && (
				<>
					{Object.entries(exemples).map(([name, exemple]) => (
						<React.Fragment key={name}>
							<h3>{name === 'base' ? 'Exemple' : capitalise0(name)}</h3>
							<Text>{`\`\`\`yaml\n${exemple}\n\`\`\``}</Text>
						</React.Fragment>
					))}
				</>
			)}
		</>
	)
}

const StyledMecanism = styled.div<{ name: string }>`
	border: 1px solid;
	max-width: 100%;
	border-radius: 3px;
	padding: 0.5rem 1rem;
	margin-bottom: 0.5rem;
	position: relative;
	flex: 1;
	flex-direction: column;
	text-align: left;
	border-color: ${({ name }) => mecanismColors(name)};
	.properties > li {
		margin: 1rem 0;
	}
`

const StyledMecanismName = styled.a<{ name: string; inline?: boolean }>`
	background-color: ${({ name }) => mecanismColors(name)} !important;
	font-size: inherit;
	display: inline-block;
	font-weight: inherit;
	width: fit-content;
	font-family: inherit;
	padding: 0.4rem 0.6rem !important;
	color: white !important;
	transition: hover 0.2s;
	:hover {
		color: white;
	}
	${(props) =>
		props.inline
			? css`
					border-radius: 0.3rem;
					margin-bottom: 0.5rem;
			  `
			: css`
					top: -0.5rem;
					position: relative;
					margin-left: -1rem;
					border-radius: 0 !important;
					border-bottom-right-radius: 0.3rem !important;
					::first-letter {
						text-transform: capitalize;
					}
			  `}
	:hover {
		opacity: 0.8;
	}
`

export const CapitalizeFirstLetter = styled.div`
	font-weight: bold;
	:first-letter {
		text-transform: capitalize;
	}
`
