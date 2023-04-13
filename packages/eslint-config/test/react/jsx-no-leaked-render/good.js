const Component = ({ count, title }) => {
	return <div>{!!count && title}</div>;
};
const Component1 = ({ count }) => {
	return <div>{!!count && <span>There are {count} results</span>}</div>;
};
const Component2 = ({ elements }) => {
	return <div>{!!elements.length && <List elements={elements} />}</div>;
};
const Component3 = ({ nestedCollection }) => {
	return (
		<div>{!!nestedCollection.elements.length && <List elements={nestedCollection.elements} />}</div>
	);
};
const Component4 = ({ elements }) => {
	return <div>{!!elements[0] && <List elements={elements} />}</div>;
};
const Component5 = ({ numberA, numberB }) => {
	return <div>{!!(numberA || numberB) && <Results>{numberA + numberB}</Results>}</div>;
};
