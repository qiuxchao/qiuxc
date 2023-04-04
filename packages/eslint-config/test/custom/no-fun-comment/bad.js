import { useSate } from 'react';

const useForm = () => {};
export const DemoComponent = () => {
	const [form] = useForm();
	const [count, setCount] = useSate(0);
	const handleClick = () => {
		setCount(80);
	};
	return (
		<div className="list-index" onClick={handleClick}>
			我是页面组件{count}
			{form}
		</div>
	);
};
