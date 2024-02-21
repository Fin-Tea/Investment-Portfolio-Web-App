import { NextResponse } from 'next/server';
export async function middleware(req) {
    const url = req.nextUrl.clone()   
    if (url.pathname === '/') {
      url.pathname = '/t/trading-journal';
      return NextResponse.redirect(url);   
    } 
    return NextResponse.next()
}