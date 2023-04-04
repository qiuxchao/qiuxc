import { useSate } from 'react';

const useForm = () => {};
export const DemoComponent = () => {
	const [form] = useForm();
	// 这是一个计数器
	const [count, setCount] = useSate(0);
	// 这是一个点击事件
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
