import styles from './header.module.css';

export default function Header({children, style}) {
    return (<h3 style={style} className={styles.header} >{children}</h3>);
}