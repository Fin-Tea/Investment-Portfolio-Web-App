import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Layout from '../components/layout-new';
import useAuth from '../hooks/auth';



export default function Login() {
    const router = useRouter();
    const {error: authError, user, login } = useAuth();

    const validationSchema = Yup.object().shape({
        email: Yup.string().required('Email is required'),
        password: Yup.string().required('Password is required')
    });
    const formOptions = { resolver: yupResolver(validationSchema) };

    const { register, handleSubmit, formState } = useForm(formOptions);
    const { errors } = formState;


    async function onSubmit({ email, password }) {
        await login({ email, password });
    }

    if (authError) {
        console.log('authError', authError);
    }
    

     useEffect(() => {
        // redirect to home if already logged in
        if (user) {
            const returnUrl = router.query.returnUrl || '/'; 
            router.push(returnUrl);
        } 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authError, user]);

    return (
    <Layout>
     <div className="container" style={{ height: '100vh' }} >
    <div className="card-body" style={{ margin: '0 auto', maxWidth: 400, border: '1px solid #c5c5c5', borderRadius: 10}}>
                    <h3>Login</h3>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                            <label>Email</label>
                            <input name="email" type="text" {...register('email')} className={`form-control ${errors.email ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.email?.message}</div>
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input name="password" type="password" {...register('password')} className={`form-control ${errors.password ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.password?.message}</div>
                        </div>
                        <button type="submit" disabled={formState.isSubmitting} className="btn btn-primary" style={{marginTop: 10}} >
                            {formState.isSubmitting && <span className="spinner-border spinner-border-sm mr-1"></span>}
                            Login
                        </button>
                        {authError &&
                            <div className="alert alert-danger mt-3 mb-0">{authError}</div>
                        }
                    </form>
                </div>
                </div>
                </Layout>
                );
}